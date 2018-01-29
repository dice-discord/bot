// Copyright 2018 Jonah Snider

// Set up dependencies
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const replaceall = require('replaceall');
const winston = require('winston');
winston.level = 'debug';
const packageData = require('./package');
const diceAPI = require('./diceAPI');
const request = require('request');
const rules = require('./rules');

// Set up bot metadata
const client = new CommandoClient({
	commandPrefix: '$',
	owner: ['210024244766179329'],
	disableEveryone: true,
	unknownCommandResponse: false,
});

client.registry
	// Registers your custom command groups
	.registerGroups([
		['dice', 'Dice'],
		['util', 'Utility'],
		['dev', 'Developer'],
		['economy', 'Economy'],
	])

	// Registers all built-in groups, commands, and argument types
	.registerDefaults()

	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, 'commands'));

// Blacklist users from commands
/*  new CommandoClient.CommandDispatcher(client.registry);

client.dispatcher.addInhibitor(async (msg) => {
    if (await diceAPI.getBlackListLevel(msg.author.id) !== false) return ['blacklisted', msg.reply('You have been blacklisted from Dice.')];
});*/

// Handle promise rejections
process.on('unhandledRejection', error => winston.error(`Uncaught Promise Rejection:\n${error}`));

// Update server counter on bot listings

// Discordbots.org
function sendDiscordBotsORGServerCount(serverData) {
	const options = {
		method: 'POST',
		url: 'https://discordbots.org/api/bots/388191157869477888/stats',
		headers: {
			'cache-control': 'no-cache',
			authorization: process.env.DISCORDBOTSORG_TOKEN,
		},
		body: {
			server_count: serverData,
		},
		json: true,
	};

	winston.debug(`[DICE] discordbots.org token: ${process.env.DISCORDBOTSORG_TOKEN}`);
	request(options, (err, httpResponse, body) => {
		if (err) return winston.error(`[DICE] ${err}`);
		if (body) {
			winston.debug(`[DICE] DiscordBots.org results:\n${body}`);
		}
	});
}

// Bots.discord.pw
function sendBotsDiscordPWServerCount(serverData) {
	const options = {
		method: 'POST',
		url: 'https://bots.discord.pw/api/bots/388191157869477888/stats',
		headers: {
			'cache-control': 'no-cache',
			authorization: process.env.BOTSDISCORDPW_TOKEN,
		},
		body: {
			server_count: serverData,
		},
		json: true,
	};

	winston.debug(`[DICE] bots.discord.pw token: ${process.env.BOTSDISCORDPW_TOKEN}`);
	request(options, (err, httpResponse, body) => {
		if (err) return winston.error(`[DICE] ${err}`);
		if (body) {
			winston.debug(`[DICE] Bots.Discord.pw results:\n${body}`);
		}
	});
}

// Bots.discordlist.net
function sendDiscordlistServerCount(serverData) {
	winston.debug(`[DICE] bots.discordlist.net token: ${process.env.DISCORDLIST_TOKEN}`);
	request(
		{
			url: 'https://bots.discordlist.net/api',
			method: 'POST',
			json: true,
			body: {
				servers: serverData,
				token: process.env.DISCORDLIST_TOKEN,
			},
		},
		(err, httpResponse, body) => {
			if (err) return winston.error(`[DICE] ${err}`);
			if (body) {
				winston.debug(`[DICE] Discordlist results:\n${body}`);
			}
		}
	);
}

// Run all three at once
function updateServerCount(serverData) {
	if (client.user.id === '388191157869477888') {
		winston.verbose('[DICE] Sending POST requests to bot listings.');
		sendDiscordBotsORGServerCount(serverData);
		sendBotsDiscordPWServerCount(serverData);
		sendDiscordlistServerCount(serverData);
	}
}
// module.exports.updateServerCount = updateServerCount;

client.on('ready', () => {
	winston.info(`[DICE] Logged in as ${client.tag}!`);
	winston.verbose(`[DICE] Node.js version: ${process.version}`);
	winston.verbose(`[DICE] Dice version v${packageData.version}`);

	// Set game presence to the help command once loaded
	client.user.setActivity('for @Dice help', {
		type: 'WATCHING',
	});

	updateServerCount(client.guilds.size);
});

// Everytime a server adds or removes Dice, announce it
async function announceServerCount(serverCount, newServer) {
	let changeTypeColor;
	if (newServer === true) {
		changeTypeColor = 0x4caf50;
	} else if (newServer === false) {
		changeTypeColor = 0xf44336;
	} else {
		changeTypeColor = 0xff9800;
	}

	// #stats
	const channel = client.channels.find('id', '399451781261950977');
	channel.send({
		embed: {
			timestamp: new Date(),
			color: changeTypeColor,
			fields: [
				{
					name: 'Server Count',
					value: `\`${serverCount}\` servers`,
				},
				{
					name: 'User Count',
					value: `\`${(await diceAPI.totalUsers()) - 1}\` users`,
				},
			],
		},
	});
}

client.on('guildCreate', () => {
	// Bot joins a new server
	updateServerCount(client.guilds.size);
	announceServerCount(client.guilds.size, true);
});

client.on('guildDelete', () => {
	// Bot leaves a server
	updateServerCount(client.guilds.size);
	announceServerCount(client.guilds.size, false);
});

client.on('guildMemberAdd', member => {
	// If member joined on the official Dice server announce it
	if (member.guild.id === rules.homeServerID) {
		const guild = client.guilds.get(rules.homeServerID);
		// #joins
		const channel = guild.channels.get('399432904809250849');
		channel.send({
			embed: {
				title: 'New Member',
				timestamp: member.joinedTimestamp,
				color: 0xff9800,
				author: {
					name: `${member.user.tag} (${member.user.id})`,
					icon_url: member.user.displayAvatarURL(128),
				},
				fields: [
					{
						name: '#⃣ Number of Server Members',
						value: `\`${guild.members.size}\` members`,
					},
				],
			},
		});
	}
});

client.on('message', async msg => {
	if (msg.content.startsWith(client.commandPrefix)) {
		// Command logger for research purposes
		const channel = client.channels.find('id', '399458745480118272');
		channel.send({
			embed: {
				author: {
					name: `${msg.author.tag} (${msg.author.id})`,
					icon_url: msg.author.displayAvatarURL(128),
				},
				timestamp: new Date(msg.createdTimestamp),
				fields: [
					{
						name: '📝 Message',
						value: msg.content,
					},
					{
						name: '🏦 User Balance',
						value: `\`${await diceAPI.getBalance(msg.author.id)}\` ${rules.currencyPlural}`,
					},
					{
						name: '🏦 Dice Balance',
						value: `\`${await diceAPI.getBalance(client.user.id)}\` ${rules.currencyPlural}`,
					},
				],
			},
		});
	}

	// Protecting bot token
	const warning = `[DICE] TOKEN COMPROMISED, REGENERATE IMMEDIATELY!\n
	https://discordapp.com/developers/applications/me/${client.user.id}\n`;

	if (msg.content.includes(process.env.BOT_TOKEN) && msg.editable) {
		// Message is from bot so edit it
		msg.edit(replaceall(process.env.BOT_TOKEN, '--snip--', msg.content));
		// prettier-ignore
		winston.error(`[DICE] ${warning}
		Bot token found and edited in message from this bot.\n
		Message: ${msg.content}`);
	} else if (msg.content.includes(process.env.BOT_TOKEN) && msg.deletable) {
		// Message can be deleted, so delete it
		msg.delete().then(() => {
			// prettier-ignore
			winston.error(`[DICE] ${warning}
			Bot token found and deleted in message by ${msg.author.tag} (${msg.author.id}).\n
			Message: ${msg.content}`);
		});
	} else if (msg.content.includes(process.env.BOT_TOKEN) && !msg.editable && !msg.deletable) {
		// Message can't be delete or edited
		// prettier-ignore
		winston.error(`[DICE] ${warning}
		Bot token found in message by ${msg.author.tag} (${msg.author.id}).\n
		Message: ${msg.content}`);
	}
	// Protecting bot token
});

// Log in the bot
client.login(process.env.BOT_TOKEN);
