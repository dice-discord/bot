// Copyright 2018 Jonah Snider

// Set up dependencies
const {
    CommandoClient,
} = require('discord.js-commando');
const path = require('path');
const winston = require('winston');
winston.level = 'debug';
const packageData = require('./package');
const diceAPI = require('./diceAPI');
const request = require('request');

// Set up bot metadata
const client = new CommandoClient({
    commandPrefix: '$',
    unknownCommandResponse: false,
    owner: ['210024244766179329'],
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

    winston.debug(`discordbots.org token: ${process.env.DISCORDBOTSORG_TOKEN}`);
    request(options, (err, httpResponse, body) => {
        if (err) return winston.error(err);
        if (body) {
            winston.debug('DiscordBots.org results:');
            winston.debug(body);
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

    winston.debug(`bots.discord.pw token: ${process.env.BOTSDISCORDPW_TOKEN}`);
    request(options, (err, httpResponse, body) => {
        if (err) return winston.error(err);
        if (body) {
            winston.debug('Bots.Discord.pw results:');
            winston.debug(body);
        }
    });
}

// Bots.discordlist.net
function sendDiscordlistServerCount(serverData) {
    winston.debug(`bots.discordlist.net token: ${process.env.DISCORDLIST_TOKEN}`);
    request({
        url: 'https://bots.discordlist.net/api',
        method: 'POST',
        json: true,
        body: {
            servers: serverData,
            token: process.env.DISCORDLIST_TOKEN,
        },
    }, (err, httpResponse, body) => {
        if (err) return winston.error(err);
        if (body) {
            winston.debug('Discordlist results:');
            winston.debug(body);
        }
    });
}

// Run all three at once
function updateServerCount(serverData) {
    if (client.user.id === '388191157869477888') {
        winston.verbose('Sending POST requests to bot listings.');
        sendDiscordBotsORGServerCount(serverData);
        sendBotsDiscordPWServerCount(serverData);
        sendDiscordlistServerCount(serverData);
    }
}
// module.exports.updateServerCount = updateServerCount;

client.on('ready', () => {
    winston.info('Logged in!');
    winston.verbose(`Node.js version: ${process.version}`);
    winston.verbose(`Dice version v${packageData.version}`);

    // Set game presence to the help command once loaded
    client.user.setActivity('for @Dice help', {
        type: 'WATCHING',
    });

    updateServerCount(client.guilds.size);
});

client.on('guildCreate', () => {
    // Bot joins a new server
    updateServerCount(client.guilds.size);
});

client.on('guildDelete', () => {
    // Bot leaves a server
    updateServerCount(client.guilds.size);
});

client.on('message', (msg) => {
    if (msg.content.startsWith(client.commandPrefix)) {
        // Command logger for research purposes
        const channel = client.channels.find('id', '399458745480118272');
        channel.send({
            embed: {
                'author': {
                    'name': msg.author.tag,
                    'icon_url': msg.author.displayAvatarURL(128),
                },
                'timestamp': new Date(msg.createdTimestamp),
                'fields': [{
                    'name': 'Message',
                    'value': msg.content,
                }, {
                    'name': 'Balance',
                    'value': diceAPI.getBalance(msg.author.id),
                },
                ],
            },
        });
    }
});

// Log in the bot
client.login(process.env.BOT_TOKEN);
