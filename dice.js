// Copyright 2018 Jonah Snider

// Set up dependencies
const { CommandoClient, FriendlyError } = require('discord.js-commando');
const { MessageEmbed, Util } = require('discord.js');
const path = require('path');
const { MongoClient } = require('mongodb');
const MongoDBProvider = require('commando-provider-mongo');
const DBL = require('dblapi.js');
const BFD = require('bfd-api');
const KeenTracking = require('keen-tracking');
const moment = require('moment');
const winston = require('winston');
winston.level = 'debug';
const diceAPI = require('./providers/diceAPI');
const request = require('request');
const rules = require('./rules');

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
	projectId: process.env.KEEN_PROJECTID,
	writeKey: process.env.KEEN_WRITEKEY
});

client.registry
	// Registers your custom command groups
	.registerGroups([
		['util', 'Utility'],
		['mod', 'Moderation'],
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
	MongoClient.connect(process.env.MONGODB_URI)
		.then(bot => new MongoDBProvider(bot, 'settings'))
);

// Blacklist users from commands
client.dispatcher.addInhibitor(msg => {
	const blacklist = client.provider.get('global', 'blacklist', []);
	if (blacklist.includes(msg.author.id)) {
		return ['blacklisted', msg.reply(`You have been blacklisted from ${client.user.username}.`)];
	} else {
		return false;
	}
});

/* Update server counter on bot listings */
const dbl = new DBL(process.env.DISCORDBOTSORG_TOKEN);
const bfd = new BFD(process.env.BOTSFORDISCORD_TOKEN);

// Bots.discord.pw
const sendBotsDiscordPWServerCount = () => {
	const options = {
		method: 'POST',
		url: 'https://bots.discord.pw/api/bots/388191157869477888/stats',
		headers: {
			authorization: process.env.BOTSDISCORDPW_TOKEN
		},
		body: {
			shard_id: client.shard.id,
			shard_count: client.shard.count,
			server_count: client.guilds.size
		},
		json: true
	};

	request(options, (err, httpResponse, body) => {
		if (err) return winston.error('[DICE]', err.stack);
		if (body) {
			winston.debug('[DICE] Bots.Discord.pw results', body);
		}
	});
};

// ls.Terminal.ink
const sendLsTerminalInkServerCount = count => {
	const options = {
		method: 'POST',
		url: `https://ls.terminal.ink/api/v1/bots/${client.id}`,
		headers: {
			authorization: process.env.LSTERMINALINK_TOKEN
		},
		body: {
			count: count
		},
		json: true
	};

	request(options, (err, httpResponse, body) => {
		if (err) return winston.error('[DICE]', err.stack);
		if (body) {
			winston.debug('[DICE] ls.Terminal.ink response', body);
		}
	});
};

const updateServerCount = async () => {
	if (client.user.id === '388191157869477888') {
		winston.verbose('[DICE] Sending POST requests to bot listings.');

		let count = await client.shard.broadcastEval('this.guilds.size');
		count = count.reduce((prev, val) => prev + val, 0);

		sendBotsDiscordPWServerCount();
		bfd.postCount(count, client.user.id);
		sendLsTerminalInkServerCount(count);
		dbl.postStats(client.guilds.size, client.shard.id, client.shard.count);
	}
};

// Everytime a server adds or removes Dice, announce it
const announceServerCount = async (serverCount, newServer, date) => {
	let changeTypeColor;
	if (newServer === true) {
		changeTypeColor = 0x4caf50;
	} else if (newServer === false) {
		changeTypeColor = 0xf44336;
	} else {
		changeTypeColor = 0xff9800;
	}

	// #stats channel
	client.channels.find('id', '399451781261950977').send({
		embed: {
			timestamp: date,
			color: changeTypeColor,
			fields: [{
				name: 'Server Count',
				value: `\`${serverCount}\` servers`
			},
			{
				name: 'User Count',
				value: `\`${(await diceAPI.totalUsers()) - 1}\` users`
			}
			]
		}
	});
};
/* Update server counter on bot listings */

/** @function
 * Announces the banning or unbanning of a user on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {User} user User who was banned/unbanned
 */
const announceGuildBanAdd = async (channel, user) => {
	const auditLogs = await channel.guild.fetchAuditLogs({
		type: 'MEMBER_BAN_ADD'
	});

	const auditEntry = auditLogs.entries.first();

	const embed = new MessageEmbed({
		title: `${user.tag} was banned`,
		author: {
			name: `${user.tag} (${user.id})`,
			iconURL: user.displayAvatarURL(128)
		},
		footer: {
			iconURL: auditEntry.executor.displayAvatarURL(128),
			text: `Banned by ${auditEntry.executor.tag} (${auditEntry.executor.id})`
		},
		color: 0xf44336,
		timestamp: auditEntry.createdAt
	});

	if (auditEntry.reason) embed.addField('📝 Reason', auditEntry.reason);

	channel.send({ embed });
};

/** @function
 * Announces the unbanning of a user on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {User} user User who was unbanned
 */
const announceGuildBanRemove = async (channel, user) => {
	const auditLogs = await channel.guild.fetchAuditLogs({
		type: 'MEMBER_BAN_REMOVE'
	});

	const auditEntry = auditLogs.entries.first();

	const embed = new MessageEmbed({
		title: `${user.tag} was unbanned`,
		author: {
			name: `${user.tag} (${user.id})`,
			iconURL: user.displayAvatarURL(128)
		},
		footer: {
			iconURL: auditEntry.executor.displayAvatarURL(128),
			text: `Unbanned by ${auditEntry.executor.tag} (${auditEntry.executor.id})`
		},
		color: 0x4caf50,
		timestamp: auditEntry.createdAt
	});

	if (auditEntry.reason) embed.addField('📝 Reason', auditEntry.reason);

	channel.send({ embed });
};

/** @function
 * Announces the kicking of a user on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {User} user User who was kicked
 */
const announceGuildKick = (channel, user) => {
	const auditEntry = channel.guild.fetchAuditLogs({
		type: 'MEMBER_KICK'
	}).then(audit => {
		return audit.entries.first();
	});

	const embed = new MessageEmbed({
		title: `${user.tag} was kicked by ${auditEntry.executor}`,
		author: {
			name: `${user.tag} (${user.id})`,
			iconURL: user.displayAvatarURL(128)
		},
		color: 0xf44334,
		timestamp: auditEntry.createdAt
	});

	if (auditEntry.reason) embed.addField('📝 Reason', auditEntry.reason);

	channel.send({ embed });
};

/** @function
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
				icon_url: member.user.displayAvatarURL(128)
			},
			fields: [{
				name: '#⃣ Number of Server Members',
				value: `\`${channel.guild.members.size}\` members`
			}]
		}
	});
};

/** @function
 * Announces the leaving of a member on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} member User who left
 */
const announceGuildMemberLeave = (channel, member) => {
	channel.send({
		embed: {
			title: 'Member left',
			timestamp: new Date(),
			footer: {
				text: `Member for around ${moment.duration(new Date() - member.joinedAt).humanize()}`
			},
			color: 0xf44336,
			author: {
				name: `${member.user.tag} (${member.user.id})`,
				icon_url: member.user.displayAvatarURL(128)
			},
			fields: [{
				name: '#⃣ Number of Server Members',
				value: `\`${channel.guild.members.size}\` members`
			}]
		}
	});
};

/** @function
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
			icon_url: newMember.user.displayAvatarURL(128)
		}
	});

	if (!oldMember.nickname && oldMember.nickname !== newMember.nickname) {
		// New nickname, no old nickname
		embed
			.setTitle('New Member Nickname')
			.addField('📝 New nickname', Util.escapeMarkdown(newMember.nickname));
		channel.send(embed);
	} else if (!newMember.nickname && oldMember.nickname !== newMember.nickname) {
		// Reset nickname
		embed
			.setTitle('Member Nickname Removed')
			.addField('📝 Old nickname', Util.escapeMarkdown(oldMember.nickname));
		channel.send(embed);
	} else if (oldMember.nickname !== newMember.nickname) {
		// Nickname change
		embed
			.setTitle('Changed Member Nickname')
			.addField('📝 New nickname', Util.escapeMarkdown(newMember.nickname))
			.addField('🕒 Old nickname', Util.escapeMarkdown(oldMember.nickname));
		channel.send(embed);
	}
};

/** @function
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
			icon_url: newMember.user.displayAvatarURL(128)
		}
	});

	if (oldMember.voiceChannel && newMember.voiceChannel && oldMember.voiceChannel !== newMember.voiceChannel) {
		// Transfering from one voice channel to another
		embed
			.setTitle('↔ Switched voice channels')
			.setColor(0xff9800)
			.addField('Old voice channel', oldMember.voiceChannel.name)
			.addField('New voice channel', newMember.voiceChannel.name);
		channel.send(embed);
	} else if (newMember.voiceChannel && newMember.voiceChannel !== oldMember.voiceChannel) {
		// Connected to a voice channel
		embed
			.setTitle('➡ Connected to a voice channel')
			.setColor(0x4caf50)
			.addField('Voice channel', newMember.voiceChannel.name);
		channel.send(embed);
	} else if (oldMember.voiceChannel && newMember.voiceChannel !== oldMember.voiceChannel) {
		// Disconnected from a voice channel
		embed
			.setTitle('⬅ Disconnected from a voice channel')
			.setColor(0xf44336)
			.addField('Voice channel', oldMember.voiceChannel.name);
		channel.send(embed);
	}
};

client
	.on('unhandledRejection', error => {
		winston.error();
		keenClient.recordEvent('errors', {
			title: 'Unhandled Promise Rejection',
			description: error.stack
		});
		client.channels.get('411563928816975883').send({
			embed: {
				title: 'Unhandled Promise Rejection',
				timestamp: new Date(),
				color: 0xf44336,
				description: `\`\`\`${error.stack}\`\`\``
			}
		});
	})
	.on('rejectionHandled', error => {
		winston.error();
		keenClient.recordEvent('errors', {
			title: 'Handled Promise Rejection',
			description: error.stack
		});
		client.channels.get('411563928816975883').send({
			embed: {
				title: 'Handled Promise Rejection',
				timestamp: new Date(),
				color: 0xf44336,
				description: `\`\`\`${error.stack}\`\`\``
			}
		});
	})
	.on('uncaughtException', error => {
		winston.error();
		keenClient.recordEvent('errors', {
			title: 'Uncaught Exception',
			description: error.stack
		});
		client.channels.get('411563928816975883').send({
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
		keenClient.recordEvent('errors', {
			title: 'Warning',
			description: warning.stack
		});
		client.channels.get('411563928816975883').send({
			embed: {
				title: 'Warning',
				timestamp: new Date(),
				color: 0xff9800,
				description: `\`\`\`${warning.stack}\`\`\``
			}
		});
	})
	.on('commandError', (command, error) => {
		if (error instanceof FriendlyError) return;
		winston.error(`[DICE]: Error in command ${command.groupID}:${command.memberName}`, error.stack);
		client.channels.get('411563928816975883').send({
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
		client.user.setActivity('for @Dice help or $$help', {
			type: 'WATCHING'
		});

		keenClient.recordEvent('events', {
			title: 'Ready',
			shard: client.shard.id
		});

		updateServerCount();
	})
	.on('guildCreate', async (guild) => {
		/* Bot joins a new server */
		let count = await client.shard.broadcastEval('this.guilds.size');
		count = count.reduce((prev, val) => prev + val, 0);
		updateServerCount();
		announceServerCount(count, true, guild.me.joinedAt);
	})
	.on('guildDelete', async () => {
		/* Bot leaves a server */
		let count = await client.shard.broadcastEval('this.guilds.size');
		count = count.reduce((prev, val) => prev + val, 0);
		updateServerCount();
		announceServerCount(count, false, new Date());
	})
	.on('guildMemberAdd', member => {
		const guildSettings = client.provider.get(member.guild, 'notifications', {});

		for (const id in guildSettings) {
			// For each channel's settinsg in the database
			if (member.guild.channels.has(id)) {
				// If the channel in the database exists on the server
				guildSettings[id].forEach(item => {
					// For each individual setting of this channel, check if the join/leave notifications are enabled
					if (item.name === 'guildMemberJoinLeave' && item.enabled === true) announceGuildMemberJoin(member.guild.channels.get(id), member);
				});
			}
		}
	})
	.on('guildMemberRemove', member => {
		const guildSettings = client.provider.get(member.guild, 'notifications', {});

		const auditEntry = member.guild.fetchAuditLogs().then(audit => {
			return audit.entries.first();
		});

		for (const id in guildSettings) {
			// For each channel's settinsg in the database
			if (member.guild.channels.has(id)) {
				// If the channel in the database exists on the server
				guildSettings[id].forEach(item => {
					// For each individual setting of this channel, check if the join/leave notifications are enabled
					if (item.name === 'guildMemberJoinLeave' && item.enabled === true) {
						announceGuildMemberLeave(member.guild.channels.get(id), member);
					}

					winston.debug(`[DICE] Target of audit entry: ${auditEntry.target.tag}`);
					winston.debug(`[DICE] Member who left: ${member.user.tag}`);
					winston.debug(`[DICE] Audit entry action: ${auditEntry.action}`);
					winston.debug(`[DICE] Current item: ${item.label} notifications. Enabled: ${item.enabled}`);
				});
			}
		}
	})
	.on('guildBanAdd', (guild, user) => {
		const guildSettings = client.provider.get(guild, 'notifications', {});

		for (const id in guildSettings) {
			// For each channel's settinsg in the database
			if (guild.channels.has(id)) {
				// If the channel in the database exists on the server
				guildSettings[id].forEach(item => {
					// For each individual setting of this channel, check if the ban/unban/kick notifications are enabled
					if (item.name === 'banUnban' && item.enabled === true) announceGuildBanAdd(guild.channels.get(id), user);
				});
			}
		}
	})
	.on('guildBanRemove', (guild, user) => {
		const guildSettings = client.provider.get(guild, 'notifications', {});

		for (const id in guildSettings) {
			// For each channel's settinsg in the database
			if (guild.channels.has(id)) {
				// If the channel in the database exists on the server
				guildSettings[id].forEach(item => {
					// For each individual setting of this channel, check if the ban/unban/kick notifications are enabled
					if (item.name === 'banUnban' && item.enabled === true) announceGuildBanRemove(guild.channels.get(id), user);
				});
			}
		}
	})
	.on('voiceStateUpdate', (oldMember, newMember) => {
		const guildSettings = client.provider.get(newMember.guild, 'notifications', {});

		for (const id in guildSettings) {
			// For each channel's settinsg in the database
			if (newMember.guild.channels.has(id)) {
				// If the channel in the database exists on the server
				guildSettings[id].forEach(item => {
					// For each individual setting of this channel, check if the ban/unban/kick notifications are enabled
					if (item.name === 'voiceChannel' && item.enabled === true && (oldMember.voiceChannel || newMember.voiceChannel)) {
						announceVoiceChannelUpdate(newMember.guild.channels.get(id), oldMember, newMember);
					}
				});
			}
		}
	})
	.on('guildMemberUpdate', (oldMember, newMember) => {
		const guildSettings = client.provider.get(newMember.guild, 'notifications', {});

		for (const id in guildSettings) {
			// For each channel's settinsg in the database
			if (newMember.guild.channels.has(id)) {
				// If the channel in the database exists on the server
				guildSettings[id].forEach(item => {
					// For each individual setting of this channel, check if the ban/unban/kick notifications are enabled
					if (item.name === 'guildMemberUpdate' && item.enabled === true && oldMember && newMember) {
						announceGuildMemberUpdate(newMember.guild.channels.get(id), oldMember, newMember);
					}
				});
			}
		}
	})
	.on('commandBlocked', async (msg, reason) => {
		const userBalance = await diceAPI.getBalance(msg.author.id);
		const houseBalance = await diceAPI.getBalance(client.user.id);

		client.channels.get('399458745480118272').send({
			embed: {
				title: 'Command Blocked',
				author: {
					name: `${msg.author.tag} (${msg.author.id})`,
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
					value: `\`${userBalance}\` ${rules.currencyPlural}`
				},
				{
					name: `🏦 ${client.user.username} Balance`,
					value: `\`${houseBalance}\` ${rules.currencyPlural}`
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
	.on('commandRun', async (cmd, promise, msg) => {
		const userBalance = await diceAPI.getBalance(msg.author.id);
		const houseBalance = await diceAPI.getBalance(client.user.id);

		// Command logger
		client.channels.get('399458745480118272').send({
			embed: {
				title: 'Command Run',
				author: {
					name: `${msg.author.tag} (${msg.author.id})`,
					icon_url: msg.author.displayAvatarURL(128)
				},
				timestamp: new Date(msg.createdTimestamp),
				fields: [{
					name: '📝 Message',
					value: msg.content
				},
				{
					name: '🏦 User Balance',
					value: `\`${userBalance}\` ${rules.currencyPlural}`
				},
				{
					name: `🏦 ${client.user.username} Balance`,
					value: `\`${houseBalance}\` ${rules.currencyPlural}`
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
	.on('message', async msg => {
		/* Protecting bot token */
		const warning = `[DICE] TOKEN COMPROMISED, REGENERATE IMMEDIATELY!\n
		https://discordapp.com/developers/applications/me/${client.user.id}\n`;

		if (msg.content.includes(process.env.BOT_TOKEN) && msg.deletable) {
			// Message can be deleted, so delete it
			msg.delete().then(() => {
				winston.error(`[DICE] ${warning}
				Bot token found and deleted in message by ${msg.author.tag} (${msg.author.id}).\n
				Message: ${msg.content}`);
			});
		} else if (msg.content.includes(process.env.BOT_TOKEN) && !msg.deletable) {
			// Message can't be deleted

			winston.error(`[DICE] ${warning}
			Bot token found in message by ${msg.author.tag} (${msg.author.id}).\n
			Message: ${msg.content}`);
		}
		/* Protecting bot token */
	});

// Log in the bot
client.login(process.env.BOT_TOKEN);
