import {Client as DiscoinClient} from '@discoin/scambio';
import {Transaction} from '@discoin/scambio/tsc_output/src/structures/transactions';
import {start as startProfiler} from '@google-cloud/profiler';
import {toDigits} from '@jonahsnider/util';
import {PrismaClient} from '@prisma/client';
import {captureException, init as initSentry} from '@sentry/node';
import {convert} from 'convert';
import {CronJob} from 'cron';
import {formatDistanceToNow} from 'date-fns';
import {AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {ClientOptions, Intents, Message, MessageEmbed, Snowflake, TextChannel, Util} from 'discord.js';
import path from 'path';
import * as pkg from '../../package.json';
import {defaultPrefix, discoin, googleBaseConfig, influxDSN, meiliSearch, nflApiToken, owners, runningInCI, runningInProduction, sentryDSN} from '../config';
import {commandArgumentPrompts, defaults, Notifications, presence, topGGWebhookPort} from '../constants';
import {baseLogger} from '../logging/logger';
import {resolver as anyUserTypeResolver, typeName as anyUserTypeName} from '../types/anyUser';
import {resolver as minecraftUserTypeResolver, typeName as minecraftUserTypeName} from '../types/minecraftUser';
import {options as commandHandlerOptions} from '../util/commandHandler';
import {channelCanBeNotified, generateUserBirthdayNotification, todayIsUsersBirthday} from '../util/notifications';
import {clusterID, findShardIDByGuildID} from '../util/shard';
import {DiceCluster} from './DiceCluster';
import {DiscordInfluxUtil} from './DiscordInfluxUtil';
import {GuildSettingsCache} from './GuildSettingsCache';
import {NoFlyList} from './NoFlyList';
import {TopGGVote, TopGGVoteWebhookHandler} from './TopGgVoteWebhookHandler';
import {MeiliSearch} from 'meilisearch';

declare module 'discord-akairo' {
	interface AkairoClient {
		commandHandler: CommandHandler;
		inhibitorHandler: InhibitorHandler;
		listenerHandler: ListenerHandler;
		guildSettingsCache: GuildSettingsCache;
		prisma: PrismaClient;
		birthdayNotificationJob: CronJob;
		discoinJob: CronJob;
		discoin?: DiscoinClient;
		meiliSearch: MeiliSearch;
	}
}

const birthdayLogger = baseLogger.scope('client');
const discoinLogger = baseLogger.scope('discoin');
const handleVoteLogger = baseLogger.scope('top.gg vote handler');
let prismaLogger = baseLogger.scope('prisma');

/**
 * An extended Akairo client with several additions.
 */
export class DiceClient extends AkairoClient {
	prisma = new PrismaClient({
		log: [
			{emit: 'event', level: 'warn'},
			{emit: 'event', level: 'info'}
		]
	});

	/** The InfluxDB util for this client. */
	influxUtil?: DiscordInfluxUtil;

	/** Top.gg webhook handler microservice. */
	topGG: TopGGVoteWebhookHandler;
	/** The cluster that spawned this client. */
	cluster?: DiceCluster;
	// Arrow function is required here, or else the `this` context will be that of the cron job
	// See https://www.npmjs.com/package/cron#gotchas
	birthdayNotificationJob = new CronJob('30 0 * * *', async () => this.notifyUserBirthdays());
	discoinJob = new CronJob('* * * * *', async () => this.processDiscoinTransactions());
	logger?: typeof baseLogger;
	nfl?: NoFlyList;
	meiliSearch = new MeiliSearch({host: meiliSearch.host, apiKey: meiliSearch.apiKey});

	/**
	 * Create a new DiceClient.
	 * @param clientOptions Discord.js client options passed in by Kurasuta
	 */
	constructor(clientOptions: ClientOptions = {}) {
		super(
			{
				ownerID: owners
			},
			{
				disableMentions: 'everyone',
				// Cache n<20 messages per channel
				messageCacheMaxSize: 20,
				// Cache messages for 15 minutes (60s * 15)
				messageCacheLifetime: convert(15).from('minutes').to('seconds'),
				// Remove messages that are past lifetime every 1 minute
				messageSweepInterval: convert(1).from('minute').to('seconds'),
				ws: {
					intents: [
						Intents.FLAGS.GUILDS,
						Intents.FLAGS.GUILD_BANS,
						Intents.FLAGS.GUILD_VOICE_STATES,
						Intents.FLAGS.GUILD_MESSAGES,
						Intents.FLAGS.DIRECT_MESSAGES,
						// This is a privileged intent:
						Intents.FLAGS.GUILD_MEMBERS
					]
				},
				presence,
				...clientOptions
			}
		);

		if (sentryDSN) {
			initSentry({
				dsn: sentryDSN,
				debug: !runningInProduction,
				environment: runningInProduction ? 'production' : 'development',
				release: `bot-${pkg.version}`
			});
		}

		this.logger = baseLogger.scope(`cluster ${clusterID}`);
		prismaLogger = baseLogger.scope(`cluster ${clusterID}`, 'prisma');

		const googleConfig = Util.mergeDefault(googleBaseConfig, {serviceContext: {service: 'bot'}});

		if (runningInProduction) {
			startProfiler(googleConfig)
				// eslint-disable-next-line promise/prefer-await-to-then
				.then(() => this.logger?.success('Started Google Cloud Profiler'))
				// eslint-disable-next-line promise/prefer-await-to-then
				.catch(error => {
					this.logger?.error('Failed to start Google Cloud Profiler', error);
					captureException(error);
				});
		}

		if (influxDSN) {
			this.influxUtil = new DiscordInfluxUtil(influxDSN, this);
		}

		if (typeof discoin.token === 'string') {
			this.discoin = new DiscoinClient(discoin.token, [discoin.currencyID]);
		}

		if (nflApiToken) {
			this.nfl = new NoFlyList(nflApiToken);
		}

		this.guildSettingsCache = new GuildSettingsCache(this.prisma);

		this.commandHandler = new CommandHandler(this, {
			prefix: async (message: Message) => {
				try {
					if (message.guild) {
						const guild = await this.guildSettingsCache.get(message.guild.id);

						return guild?.prefix ?? defaultPrefix;
					}
				} catch (error: unknown) {
					(this.logger ?? baseLogger).error(error);
				}

				return defaultPrefix;
			},
			argumentDefaults: {
				prompt: {
					timeout: commandArgumentPrompts.timeout,
					cancel: commandArgumentPrompts.cancel,
					ended: commandArgumentPrompts.ended,
					modifyStart: (_message, string) => commandArgumentPrompts.modify.start(string),
					modifyRetry: (_message, string) => commandArgumentPrompts.modify.retry(string),
					optional: false
				}
			},
			...commandHandlerOptions
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: path.join(__dirname, '..', 'inhibitors')
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: path.join(__dirname, '..', 'listeners')
		});

		this.commandHandler.resolver.addType(anyUserTypeName, anyUserTypeResolver);
		this.commandHandler.resolver.addType(minecraftUserTypeName, minecraftUserTypeResolver);

		this.topGG = new TopGGVoteWebhookHandler({client: this});
	}

	async init(): Promise<this> {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);

		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});

		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();

		this.prisma.$on('info', event => {
			prismaLogger.info(event);
		});
		this.prisma.$on('warn', event => {
			prismaLogger.warn(event);
		});

		if (!runningInCI) {
			await this.prisma.$connect();
		}

		this.birthdayNotificationJob.start();

		if (runningInProduction && this.shard?.id === 0) {
			this.discoinJob.start();
		}

		this.topGG.on('vote', async vote => this.handleVote(vote));
		this.topGG.server.listen(topGGWebhookPort);

		return this;
	}

	/**
	 * Send notifications about user birthdays to all channels that have it enabled.
	 * This should be run once each day.
	 */
	async notifyUserBirthdays(): Promise<void> {
		birthdayLogger.time('birthday notifications');
		const now = new Date();

		const guilds = await this.prisma.notificationSettings.findMany({
			where: {id: Notifications.UserAccountBirthday},
			select: {channels: true, guildId: true}
		});

		// Normalize our data for processing
		// This also makes schema changes really easy to adapt to
		const queue: Array<{id: Snowflake; channels: Snowflake[]}> = guilds.map(guild => ({id: guild.guildId, channels: guild.channels}));

		const notificationCache = new Map<Snowflake, MessageEmbed>();

		await Promise.all(
			queue.map(async entry => {
				const guild = this.guilds.cache.get(entry.id);

				if (!guild) {
					return;
				}

				const notifications = guild.members.cache
					.filter(member => !member.user.bot && todayIsUsersBirthday(now, member.user))
					.map(member => {
						const cached = notificationCache.get(member.user.id);

						if (cached) {
							return cached;
						}

						const embed = generateUserBirthdayNotification(member.user);

						notificationCache.set(member.user.id, embed);
						return embed;
					});

				await Promise.all(
					entry.channels.map(async channelID => {
						if (await channelCanBeNotified(Notifications.UserAccountBirthday, guild, channelID)) {
							const channel = guild.channels.cache.get(channelID) as TextChannel;

							await Promise.all(notifications.map(async notification => channel.send(notification)));
						}
					})
				);
			})
		);

		birthdayLogger.timeEnd('birthday notifications');
	}

	/**
	 * Process all unhandled Discoin transactions
	 */
	async processDiscoinTransactions(): Promise<void> {
		if (!this.discoin) {
			discoinLogger.warn('Attempted processing transactions when no Discoin client exists');
			return;
		}

		let transactions: Transaction[];

		try {
			const data = await this.discoin.transactions.getMany(this.discoin.commonQueries.UNHANDLED_TRANSACTIONS);
			transactions = Array.isArray(data) ? data : data.data;
		} catch (error: unknown) {
			discoinLogger.error('An error occured while getting all unhandled transactions from the Discoin API', error);
			return;
		}

		await Promise.all(transactions.map(async transaction => this.handleDiscoinTransaction(transaction)));
	}

	/**
	 * Handles a single Discoin transaction by paying the user and notifying them about it.
	 * @param transaction Transaction to handle
	 * @returns The message notifying the user or `undefined` if the user wasn't notified
	 */
	async handleDiscoinTransaction(transaction: Transaction): Promise<Message | undefined> {
		const userQuery = {id: transaction.user};

		const actualPayout = toDigits(transaction.payout, 2);
		const {balance: updatedBalance} = await this.prisma.user.upsert({
			where: userQuery,
			update: {balance: {increment: actualPayout}},
			create: {...userQuery, balance: defaults.startingBalance.users + actualPayout},
			select: {balance: true}
		});

		try {
			await transaction.update({handled: true});
		} catch (error: unknown) {
			discoinLogger.error(`Error while marking transaction ${transaction.id} as handled`, error);
			// If it wasn't marked as handled don't pay them, keep transactions atomic
			await this.prisma.user.update({where: userQuery, data: {balance: {decrement: actualPayout}}});

			return;
		}

		const discordUser = await this.users.fetch(transaction.user);

		const dashboardLink = `https://dash.discoin.zws.im/#/transactions/${transaction.id}/show`;

		return discordUser.send(
			new MessageEmbed({
				title: 'Discoin Conversion Received',
				url: dashboardLink,
				timestamp: transaction.timestamp,
				footer: {text: `Took ${formatDistanceToNow(transaction.timestamp, {includeSeconds: true})} to process this transaction`},
				thumbnail: {
					url: 'https://avatars2.githubusercontent.com/u/30993376'
				},
				description: `Your updated balance is now ${updatedBalance.toLocaleString()} oat${updatedBalance === 1 ? '' : 's'}`,
				fields: [
					{
						name: 'Amount',
						value: `${transaction.amount.toLocaleString()} ${transaction.from.id} ➡ ${transaction.payout.toLocaleString()} OAT`
					},
					{
						name: 'Transaction ID',
						value: `[\`${transaction.id}\`](${dashboardLink})`
					}
				]
			})
		);
	}

	/**
	 * Handle a top.gg vote by rewarding a user and notifying them.
	 * @param vote The vote to handle
	 * @returns The user's updated balance
	 */
	async handleVote(vote: TopGGVote): Promise<number> {
		const reward = defaults.vote[vote.weekend ? 'weekend' : 'base'];
		const {balance: updatedBalance} = await this.prisma.user.update({where: {id: vote.user}, data: {balance: {increment: reward}}, select: {balance: true}});

		try {
			const user = await this.users.fetch(vote.user);
			await user.send(
				[
					'Thank you for voting on top.gg',
					`You have been given ${bold`${reward.toLocaleString()}`} oats as a reward`,
					`Your updated balance is ${bold`${updatedBalance.toLocaleString()}`}`
				].join('\n')
			);
		} catch (error: unknown) {
			handleVoteLogger.error(`Unable to notify ${vote.user} about their voting rewards`, error);
		}

		return updatedBalance;
	}

	async destroy(): Promise<void> {
		this.topGG.server.close();
		await this.prisma.$disconnect();

		super.destroy();
	}

	/**
	 * Returns the number of guilds that this cluster is responsible for.
	 */
	responsibleGuildCount(): Record<number, number> {
		const guildIDs = this.guilds.cache.keyArray();

		const count: Record<number, number> = {};

		for (const id of guildIDs) {
			const shard = findShardIDByGuildID(id, BigInt(this.shard?.shardCount ?? 0));

			count[shard] = (count[shard] ?? 0) + 1;
		}

		return count;
	}
}
