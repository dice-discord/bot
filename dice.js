// Copyright 2018 Jonah Snider

// Set up dependencies
const { CommandoClient, FriendlyError } = require('discord.js-commando'),
	{ MessageEmbed, Util } = require('discord.js'),
	path = require('path'),
	{ MongoClient } = require('mongodb'),
	MongoDBProvider = require('commando-provider-mongo'),
	DBL = require('dblapi.js'),
	BFD = require('bfd-api'),
	KeenTracking = require('keen-tracking'),
	moment = require('moment'),
	winston = require('winston'),
	diceAPI = require('./providers/diceAPI'),
	rp = require('request-promise-native'),
	Raven = require('raven'),
	config = require('./config');

winston.level = 'debug';
Raven.config(config.sentryURI).install();

// Set up bot client and settings
const client = new CommandoClient({
	commandPrefix: '$$',
	owner: '210024244766179329',
	disableEveryone: true,
	unknownCommandResponse: false,
	invite: 'https://discord.gg/NpUmRkj'
});

// Set up Keen client
const keenClient = new KeenTracking({
	projectId: config.keen.projectID,
	writeKey: config.keen.writeKey
});

client.registry
	// Registers your custom command groups
	.registerGroups([
		['util', 'Utility'],
		['mod', 'Moderation'],
		['search', 'Search'],
		['games', 'Games'],
		['fun', 'Fun'],
		['selfroles', 'Selfroles'],
		['minecraft', 'Minecraft'],
		['economy', 'Economy'],
		['dev', 'Developer']
	])

	// Registers all built-in groups, commands, and argument types
	.registerDefaults()

	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, 'commands'))
	// Register custom argument types in the ./types directory
	.registerTypesIn(path.join(__dirname, 'types'));

// Store settings (like a server prefix) in a MongoDB collection called "settings"
client.setProvider(
	MongoClient.connect(config.mongoDBURI)
	.then(bot => new MongoDBProvider(bot, 'settings'))
);

/**
 * Blacklist users from commands
 */
client.dispatcher.addInhibitor(msg => {
	const blacklist = client.provider.get('global', 'blacklist', []);
	if(blacklist.includes(msg.author.id)) {
		return ['blacklisted', msg.reply(`You have been blacklisted from ${client.user.username}.`)];
	} else {
		return false;
	}
});

// Use libraries for tracking server count
const dbl = new DBL(config.discordBotsListToken);
const bfd = new BFD(config.botsForDiscordToken);

/**
 * Bots.discord.pw
 */
const sendBotsDiscordPWServerCount = () => {
	const options = {
		method: 'POST',
		url: 'https://bots.discord.pw/api/bots/388191157869477888/stats',
		headers: { authorization: config.discordBotsToken },
		body: {
			/* eslint-disable camelcase */
			shard_id: client.shard.id,
			shard_count: client.shard.count,
			server_count: client.guilds.size
			/* eslint-enable camelcase */
		},
		json: true
	};

	rp(options).catch(error => winston.error('[DICE] Error in POSTing to bots.discord.pw', error.stack));
};

/**
 * Botlist.space
 * @async
 * @param {number} count Server count
 */
const sendBotListSpaceServerCount = count => {
	const options = {
		method: 'POST',
		url: 'https://botlist.space/api/bots/388191157869477888',
		headers: { authorization: config.botsListSpaceToken },
		// eslint-disable-next-line camelcase
		body: { server_count: count },
		json: true
	};

	rp(options).catch(error => winston.error('[DICE] Error in POSTing to botlist.space', error.stack));
};

/**
 * @async
 * Updates the server count on bot listings
 */
const updateServerCount = async() => {
	if(client.user.id === '388191157869477888') {
		winston.verbose('[DICE] Sending POST requests to bot listings.');

		let count = await client.shard.broadcastEval('this.guilds.size');
		count = count.reduce((prev, val) => prev + val, 0);

		sendBotsDiscordPWServerCount();
		sendBotListSpaceServerCount(count);
		bfd.postCount(count, client.user.id);
		dbl.postStats(client.guilds.size, client.shard.id, client.shard.count);
	}
};

/**
 * @async
 * @param {number} serverCount Updated server count
 * @param {boolean} newServer Boolean indicating if this update was joining or leaving a server
 * @param {Date} date Timestamp of update
 */
const announceServerCount = async(serverCount, newServer, date) => {
	let changeTypeColor;
	if(newServer === true) {
		changeTypeColor = 0x4caf50;
	} else if(newServer === false) {
		changeTypeColor = 0xf44336;
	} else {
		changeTypeColor = 0xff9800;
	}

	// Server joins channel
	client.channels.get(config.channels.joinLogs).send({
		embed: {
			timestamp: date,
			color: changeTypeColor,
			fields: [{
				name: 'Server Count',
				value: `\`${serverCount}\` servers`
			},
			{
				name: 'User Count',
				value: `\`${await diceAPI.totalUsers() - 1}\` users`
			}
			]
		}
	});
};

/**
 * Announces the banning or unbanning of a user on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {User} user User who was banned/unbanned
 */
const announceGuildBanAdd = async(channel, user) => {
	const embed = new MessageEmbed({
		title: `${user.tag} was banned`,
		author: {
			name: `${user.tag} (${user.id})`,
			iconURL: user.displayAvatarURL(128)
		},
		color: 0xf44336
	});

	if(channel.permissionsFor(channel.guild.me).has('VIEW_AUDIT_LOG')) {
		const auditLogs = await channel.guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' });
		const auditEntry = auditLogs.entries.first();

		if(auditEntry.reason) embed.addField('📝 Reason', auditEntry.reason);
		embed.setTimestamp(auditEntry.createdAt);
		embed.setFooter(`Banned by ${auditEntry.executor.tag} (${auditEntry.executor.id})`,
		auditEntry.executor.displayAvatarURL(128));
	} else {
		embed.setFooter('Give me permissions to view the audit log and more information will appear');
		embed.setTimestamp(new Date());
	}


	channel.send({ embed });
};

/**
 * Announces the unbanning of a user on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {User} user User who was unbanned
 */
const announceGuildBanRemove = async(channel, user) => {
	const embed = new MessageEmbed({
		title: `${user.tag} was unbanned`,
		author: {
			name: `${user.tag} (${user.id})`,
			iconURL: user.displayAvatarURL(128)
		},
		color: 0x4caf50
	});

	if(channel.permissionsFor(channel.guild.me).has('VIEW_AUDIT_LOG')) {
		const auditLogs = await channel.guild.fetchAuditLogs({ type: 'MEMBER_BAN_REMOVE' });
		const auditEntry = auditLogs.entries.first();

		if(auditEntry.reason) embed.addField('📝 Reason', auditEntry.reason);
		embed.setTimestamp(auditEntry.createdAt);
		embed.setFooter(`Unbanned by ${auditEntry.executor.tag} (${auditEntry.executor.id})`,
		auditEntry.executor.displayAvatarURL(128));
	} else {
		embed.setFooter('Give me permissions to view the audit log and more information will appear');
		embed.setTimestamp(new Date());
	}

	channel.send({ embed });
};

/**
 * Announces the joining of a member on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} member User who joined
 */
const announceGuildMemberJoin = (channel, member) => {
	channel.send({
		embed: {
			title: 'New Member',
			timestamp: member.joinedAt,
			color: 0x4caf50,
			author: {
				name: `${member.user.tag} (${member.user.id})`,
				// eslint-disable-next-line camelcase
				icon_url: member.user.displayAvatarURL(128)
			},
			fields: [{
				name: '#⃣ Number of Server Members',
				value: `\`${channel.guild.members.size}\` members`
			}]
		}
	});
};

/**
 * Announces the leaving of a member on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} member User who left
 */
const announceGuildMemberLeave = (channel, member) => {
	channel.send({
		embed: {
			title: 'Member left',
			timestamp: new Date(),
			footer: { text: `Member for around ${moment.duration(new Date() - member.joinedAt).humanize()}` },
			color: 0xf44336,
			author: {
				name: `${member.user.tag} (${member.user.id})`,
				// eslint-disable-next-line camelcase
				icon_url: member.user.displayAvatarURL(128)
			},
			fields: [{
				name: '#⃣ Number of Server Members',
				value: `\`${channel.guild.members.size}\` members`
			}]
		}
	});
};

/**
 * Announces a guild member update
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} oldMember Old member from update
 * @param {GuildMember} newMember New member from update
 */
const announceGuildMemberUpdate = (channel, oldMember, newMember) => {
	const embed = new MessageEmbed({
		color: 0xff9800,
		timestamp: new Date(),
		author: {
			name: `${newMember.user.tag} (${newMember.user.id})`,
			// eslint-disable-next-line camelcase
			icon_url: newMember.user.displayAvatarURL(128)
		}
	});

	if(!oldMember.nickname && oldMember.nickname !== newMember.nickname) {
		// New nickname, no old nickname
		embed
			.setTitle('New Member Nickname')
			.addField('📝 New nickname', Util.escapeMarkdown(newMember.nickname));
		channel.send(embed);
	} else if(!newMember.nickname && oldMember.nickname !== newMember.nickname) {
		// Reset nickname
		embed
			.setTitle('Member Nickname Removed')
			.addField('📝 Old nickname', Util.escapeMarkdown(oldMember.nickname));
		channel.send(embed);
	} else if(oldMember.nickname !== newMember.nickname) {
		// Nickname change
		embed
			.setTitle('Changed Member Nickname')
			.addField('📝 New nickname', Util.escapeMarkdown(newMember.nickname))
			.addField('🕒 Old nickname', Util.escapeMarkdown(oldMember.nickname));
		channel.send(embed);
	}
};

/**
 * Announces a guild member's voice connection status
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} oldMember Old member from update
 * @param {GuildMember} newMember New member from update
 */
const announceVoiceChannelUpdate = (channel, oldMember, newMember) => {
	const embed = new MessageEmbed({
		timestamp: new Date(),
		author: {
			name: `${newMember.user.tag} (${newMember.user.id})`,
			// eslint-disable-next-line camelcase
			icon_url: newMember.user.displayAvatarURL(128)
		}
	});

	if(oldMember.voiceChannel && newMember.voiceChannel && oldMember.voiceChannel !== newMember.voiceChannel) {
		// Transfering from one voice channel to another
		embed
			.setTitle('↔ Switched voice channels')
			.setColor(0xff9800)
			.addField('Old voice channel', oldMember.voiceChannel.name)
			.addField('New voice channel', newMember.voiceChannel.name);
		channel.send(embed);
	} else if(newMember.voiceChannel && newMember.voiceChannel !== oldMember.voiceChannel) {
		// Connected to a voice channel
		embed
			.setTitle('➡ Connected to a voice channel')
			.setColor(0x4caf50)
			.addField('Voice channel', newMember.voiceChannel.name);
		channel.send(embed);
	} else if(oldMember.voiceChannel && newMember.voiceChannel !== oldMember.voiceChannel) {
		// Disconnected from a voice channel
		embed
			.setTitle('⬅ Disconnected from a voice channel')
			.setColor(0xf44336)
			.addField('Voice channel', oldMember.voiceChannel.name);
		channel.send(embed);
	}
};

/**
 * @async
 */
const checkDiscoinTransactions = async() => {
	const transactions = await rp({
		json: true,
		method: 'GET',
		url: 'http://discoin.sidetrip.xyz/transactions',
		headers: { Authorization: config.discoinToken }
	}).catch(error => winston.error('[DICE] Error in Discoin transaction GETting', error));

	winston.debug('[DICE] All Discoin transactions:', transactions);

	for(const transaction of transactions) {
		if(transaction.type !== 'refund') {
			winston.debug('[DICE] Discoin transaction fetched:', transaction);
			diceAPI.increaseBalance(transaction.user, transaction.amount);

			const embed = new MessageEmbed({
				title: '💱 Discoin Conversion Received',
				url: 'https://discoin.sidetrip.xyz/record',
				timestamp: new Date(transaction.timestamp * 1000),
				thumbnail: { url: 'https://avatars2.githubusercontent.com/u/30993376' },
				fields: [{
					name: '💰 Amount',
					value: `${transaction.source} ➡ ${transaction.amount} OAT`
				}, {
					name: '🗒 Receipt',
					value: `\`${transaction.receipt}\``
				}]
			});

			// eslint-disable-next-line no-await-in-loop
			(await client.users.fetch(transaction.user)).send({ embed }).catch(error => {
				winston.error(`[DICE] Unable to send DM about Discoin conversion to ${transaction.user}`, error);
			});

			// eslint-disable-next-line no-await-in-loop
			const user = await client.users.fetch(transaction.user);

			embed.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL(128));

			client.channels.get(config.channels.commandLogs).send({ embed });
		}
	}
};

client
	.on('unhandledRejection', (reason, promise) => {
		winston.error();
		Raven.captureException(reason);
		keenClient.recordEvent('errors', {
			title: 'Unhandled Promise Rejection',
			description: reason.stack
		});
		client.channels.get(config.channels.errors).send({
			embed: {
				title: 'Unhandled Promise Rejection',
				timestamp: new Date(),
				color: 0xf44336,
				description: `${promise}\n\`\`\`${reason.stack}\`\`\``
			}
		});
	})
	.on('rejectionHandled', (reason, promise) => {
		winston.error();
		Raven.captureException(reason);
		keenClient.recordEvent('errors', {
			title: 'Handled Promise Rejection',
			description: reason.stack
		});
		client.channels.get(config.channels.errors).send({
			embed: {
				title: 'Handled Promise Rejection',
				timestamp: new Date(),
				color: 0xf44336,
				description: `${promise}\n\`\`\`${reason.stack}\`\`\``
			}
		});
	})
	.on('uncaughtException', error => {
		winston.error();
		Raven.captureException(error);
		keenClient.recordEvent('errors', {
			title: 'Uncaught Exception',
			description: error.stack
		});
		client.channels.get(config.channels.errors).send({
			embed: {
				title: 'Uncaught Exception',
				timestamp: new Date(),
				color: 0xf44336,
				description: `\`\`\`${error.stack}\`\`\``
			}
		});
	})
	.on('warning', warning => {
		winston.warn();
		Raven.captureException(warning);
		keenClient.recordEvent('errors', {
			title: 'Warning',
			description: warning.stack
		});
		client.channels.get(config.channels.errors).send({
			embed: {
				title: 'Warning',
				timestamp: new Date(),
				color: 0xff9800,
				description: `\`\`\`${warning.stack}\`\`\``
			}
		});
	})
	.on('commandError', (command, error) => {
		if(error instanceof FriendlyError) return;
		Raven.captureException(error);
		winston.error(`[DICE]: Error in command ${command.groupID}:${command.memberName}`, error.stack);
		client.channels.get(config.channels.errors).send({
			embed: {
				title: 'Command Error',
				timestamp: new Date(),
				color: 0xf44336,
				description: `Error in command \`${command.groupID}:${command.memberName}\`\n\`\`\`${error.stack}\`\`\``
			}
		});
	})
	.on('ready', () => {
		winston.info(`[DICE] Logged in as ${client.user.tag}!`);

		// Set game presence to the help command once loaded
		client.user.setActivity('for @Dice help or $$help', { type: 'WATCHING' });

		keenClient.recordEvent('events', {
			title: 'Ready',
			shard: client.shard.id
		});

		updateServerCount();

		checkDiscoinTransactions();
		client.setInterval(checkDiscoinTransactions, 300000);
	})
	.on('guildCreate', async guild => {
		/* Bot joins a new server */
		let count = await client.shard.broadcastEval('this.guilds.size');
		count = count.reduce((prev, val) => prev + val, 0);
		updateServerCount();
		announceServerCount(count, true, guild.me.joinedAt);
	})
	.on('guildDelete', async() => {
		/* Bot leaves a server */
		let count = await client.shard.broadcastEval('this.guilds.size');
		count = count.reduce((prev, val) => prev + val, 0);
		updateServerCount();
		announceServerCount(count, false, new Date());
	})
	.on('guildMemberAdd', member => {
		const guildSettings = client.provider.get(member.guild, 'notifications', {});

		for(const id in guildSettings) {
			const channelSettings = guildSettings[id];
			// If the channel in the database exists on the server
			// eslint-disable-next-line max-len
			if(member.guild.channels.has(id) && channelSettings[1] === true) announceGuildMemberJoin(member.guild.channels.get(id), member);
		}
	})
	.on('guildMemberRemove', member => {
		const guildSettings = client.provider.get(member.guild, 'notifications', {});

		for(const id in guildSettings) {
			const channelSettings = guildSettings[id];
			// If the channel in the database exists on the server
			// eslint-disable-next-line max-len
			if(member.guild.channels.has(id) && channelSettings[1] === true) announceGuildMemberLeave(member.guild.channels.get(id), member);
		}
	})
	.on('guildBanAdd', (guild, user) => {
		const guildSettings = client.provider.get(guild, 'notifications', {});

		for(const id in guildSettings) {
			const channelSettings = guildSettings[id];
			// If the channel in the database exists on the server
			if(guild.channels.has(id) && channelSettings[0] === true) announceGuildBanAdd(guild.channels.get(id), user);
		}
	})
	.on('guildBanRemove', (guild, user) => {
		const guildSettings = client.provider.get(guild, 'notifications', {});

		for(const id in guildSettings) {
			const channelSettings = guildSettings[id];
			// If the channel in the database exists on the server
			// eslint-disable-next-line max-len
			if(guild.channels.has(id) && channelSettings[0] === true) announceGuildBanRemove(guild.channels.get(id), user);
		}
	})
	.on('voiceStateUpdate', (oldMember, newMember) => {
		const guildSettings = client.provider.get(newMember.guild, 'notifications', {});

		for(const id in guildSettings) {
			const channelSettings = guildSettings[id];
			// If the channel in the database exists on the server
			// eslint-disable-next-line max-len
			if(newMember.guild.channels.has(id) && channelSettings[2] === true && (oldMember.voiceChannel || newMember.voiceChannel)) announceVoiceChannelUpdate(newMember.guild.channels.get(id), oldMember, newMember);
		}
	})
	.on('guildMemberUpdate', (oldMember, newMember) => {
		const guildSettings = client.provider.get(newMember.guild, 'notifications', {});

		for(const id in guildSettings) {
			const channelSettings = guildSettings[id];
			// If the channel in the database exists on the server
			// eslint-disable-next-line max-len
			if(newMember.guild.channels.has(id) && channelSettings[3] === true && oldMember && newMember) announceGuildMemberUpdate(newMember.guild.channels.get(id), oldMember, newMember);
		}
	})
	.on('commandBlocked', async(msg, reason) => {
		const userBalance = await diceAPI.getBalance(msg.author.id);
		const houseBalance = await diceAPI.getBalance(client.user.id);

		client.channels.get(config.channels.commandLogs).send({
			embed: {
				title: 'Command Blocked',
				author: {
					name: `${msg.author.tag} (${msg.author.id})`,
					// eslint-disable-next-line camelcase
					icon_url: msg.author.displayAvatarURL(128)
				},
				timestamp: new Date(msg.createdTimestamp),
				fields: [{
					name: '📝 Message',
					value: msg.content
				}, {
					name: '⛔ Reason',
					value: reason
				},
				{
					name: '🏦 User Balance',
					value: `\`${userBalance}\` ${config.currency.plural}`
				},
				{
					name: `🏦 ${client.user.username} Balance`,
					value: `\`${houseBalance}\` ${config.currency.plural}`
				}
				]
			}
		});

		keenClient.recordEvent('blockedCommands', {
			author: msg.author,
			reason: reason,
			timestamp: new Date(msg.createdTimestamp),
			message: msg.content,
			userBalance: userBalance,
			houseBalance: houseBalance
		});
	})
	.on('commandRun', async(cmd, promise, msg) => {
		const userBalance = await diceAPI.getBalance(msg.author.id),
			houseBalance = await diceAPI.getBalance(client.user.id);

		// Command logger
		client.channels.get(config.channels.commandLogs).send({
			embed: {
				title: 'Command Run',
				author: {
					name: `${msg.author.tag} (${msg.author.id})`,
					// eslint-disable-next-line camelcase
					icon_url: msg.author.displayAvatarURL(128)
				},
				timestamp: new Date(msg.createdTimestamp),
				fields: [{
					name: '📝 Message',
					value: msg.content
				},
				{
					name: '🏦 User Balance',
					value: `\`${userBalance}\` ${config.currency.plural}`
				},
				{
					name: `🏦 ${client.user.username} Balance`,
					value: `\`${houseBalance}\` ${config.currency.plural}`
				}
				]
			}
		});

		keenClient.recordEvent('commands', {
			author: msg.author,
			timestamp: new Date(msg.createdTimestamp),
			message: msg.content,
			userBalance: userBalance,
			houseBalance: houseBalance
		});

		winston.silly(`[DICE] Command run by ${msg.author.tag} (${msg.author.id}): ${msg.content}`);
	})
	.on('message', msg => {
		/* Protecting bot token */
		const warning = `[DICE] TOKEN COMPROMISED, REGENERATE IMMEDIATELY!\n
		https://discordapp.com/developers/applications/me/${client.user.id}\n`;

		if(msg.content.includes(config.botToken) && msg.deletable) {
			// Message can be deleted, so delete it
			msg.delete().then(() => {
				winston.error(`[DICE] ${warning}
				Bot token found and deleted in message by ${msg.author.tag} (${msg.author.id}).\n
				Message: ${msg.content}`);
			});
		} else if(msg.content.includes(config.botToken) && !msg.deletable) {
			// Message can't be deleted

			winston.error(`[DICE] ${warning}
			Bot token found in message by ${msg.author.tag} (${msg.author.id}).\n
			Message: ${msg.content}`);
		}
		/* Protecting bot token */
	});

// Log in the bot
client.login(config.botToken);
