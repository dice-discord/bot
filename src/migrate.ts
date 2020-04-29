import {Tag} from '@prisma/client';
import {Snowflake} from 'discord.js';
import {writeFileSync} from 'fs';
import {MongoClient} from 'mongodb';
import {join} from 'path';
import {Notifications} from './constants';
import {simpleFormat} from './util/format';
import * as dotenv from 'dotenv';
import {PrismaClient} from '@prisma/client';

dotenv.config({path: join(__dirname, '..', 'bot.env')});

const prisma = new PrismaClient();

const enum ExitCodes {
	Success,
	NoMongoURI,
	GenericError
}

if (!process.env.MONGODB_URI) {
	console.error('No MongoDB URI was provided');
	process.exit(ExitCodes.NoMongoURI);
}

interface EconomyDocument {
	_id: string;
	/** @example 'keyv:388191157869477888' */
	key: string;
	value: {
		/** Balance */
		value: number;
	};
}

interface GuildDocument {
	_id: string;
	/** @example 'keyv:388191157869477888' */
	key: string;
	value: {
		value: Partial<{
			prefix: string;
			selfRoles: Snowflake[];
			tags: {[id: string]: {author: Snowflake; value: string}};
			notifications: {[channel: string]: boolean[]};
		}>;
	};
}

// Index is the index in the old DB, value is the new ID
const legacyNotifications: Notifications[] = [
	Notifications.BanUnban,
	Notifications.GuildMemberJoinLeave,
	Notifications.VoiceChannel,
	Notifications.GuildMemberUpdate,
	Notifications.UserAccountBirthday,
	Notifications.MessageDelete,
	Notifications.MessageUpdate
];

// Prisma.user.upsert({where: {id: 'overcoder'}, create: {id: 'overcoder', balance: -1}, update: {blacklistReason: 'caught lackin'}});

function stripKeyvPrefix(value: string): Snowflake {
	return value.split(':')[1];
}

const mongo = new MongoClient(process.env.MONGODB_URI, {useUnifiedTopology: true});

export async function migrate(): Promise<ExitCodes | undefined> {
	await mongo.connect();

	const db = mongo.db('dice');
	const economy = db.collection<EconomyDocument>('economy');
	const guilds = db.collection<GuildDocument>('settings');

	console.log('loading DB into memory for conversion');

	const economyDocs: EconomyDocument[] = await economy.find().toArray();
	const guildDocs: GuildDocument[] = [...new Set(await guilds.find().toArray())];

	const guildJobs = guildDocs.map(async (guild, index) => {
		const guildID = stripKeyvPrefix(guild.key);

		if (guildID === 'global') {
			return;
		}

		const oldTags = guild.value.value.tags;

		const newTags: Array<Omit<Tag, 'guildId'>> = [];

		for (const tagID in oldTags) {
			if (oldTags.hasOwnProperty(tagID)) {
				const tag = oldTags[tagID];

				newTags.push({id: tagID, author: tag.author, content: tag.value});
			}
		}

		const oldNotifs = guild.value.value.notifications;
		const newNotifs: Array<{
			id: Notifications;
			channels: {set: string[]};
		}> = [];
		if (oldNotifs) {
			for (const channel in oldNotifs) {
				const config = oldNotifs[channel];

				config.forEach((enabled, index) => {
					if (enabled) {
						const entry = newNotifs.find(notif => notif.id === legacyNotifications[index]);

						if (entry) {
							entry.channels.set.push(channel);
						} else {
							newNotifs.push({id: legacyNotifications[index], channels: {set: [channel]}});
						}
					}
				});
			}
		}

		return prisma.guild.create({
			data: {
				id: guildID,
				prefix: guild.value.value.prefix,
				notifications: {create: newNotifs},
				selfRoles: {set: guild.value.value.selfRoles ?? []},
				tags: {create: newTags}
			}
		});
	});

	const usersCSV = economyDocs.map(doc => `${simpleFormat(doc.value.value)},,,${stripKeyvPrefix(doc.key)}`).join('\n');

	writeFileSync('./migrate_users.csv', usersCSV, {encoding: 'utf-8'});

	await Promise.all(guildJobs);

	return ExitCodes.Success;
}

console.log('about to start migration');

migrate()
	.then(exitCode => process.exit(exitCode ?? ExitCodes.GenericError))
	.catch(error => {
		console.error(error);
		process.exit(ExitCodes.GenericError);
	});
