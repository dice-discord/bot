// Copyright 2018 Jonah Snider

// Set up dependencies
const {
    CommandoClient
} = require("discord.js-commando");
const path = require("path");
const winston = require("winston");
winston.level = "debug";
const packageData = require("./package");
const request = require("request");

// Set up bot metadata
const client = new CommandoClient({
    commandPrefix: "$",
    unknownCommandResponse: false,
    owner: ["210024244766179329"]
});

client.registry
    // Registers your custom command groups
    .registerGroups([
        ["dice", "Dice"],
        ["util", "Utility"],
        ["dev", "Developer"],
        ["economy", "Economy"]
    ])

    // Registers all built-in groups, commands, and argument types
    .registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, "commands"));

client.on("ready", () => {
    winston.info("Logged in!");
    winston.verbose("Node.js version: " + process.version);
    winston.verbose(`Dice version v${packageData["version"]}`);

    // Set game presence to the help command once loaded
    client.user.setActivity("for @Dice help", {
        "type": "WATCHING"
    });

    // Update server counter on bot listings

    // Run all three at once
    function updateServerCount() {
        winston.verbose("Sending POST requests to bot listings.");
        sendDiscordBotsORGServerCount();
        sendBotsDiscordPWServerCount();
        sendDiscordlistServerCount();
    }

    // discordbots.org
    function sendDiscordBotsORGServerCount() {
        let options = {
            "method": "POST",
            "url": "https://discordbots.org/api/bots/388191157869477888/stats",
            "headers": {
                "cache-control": "no-cache",
                "authorization": process.env.DISCORDBOTSORG_TOKEN
            },
            "body": {
                "server_count": client.guilds.size
            },
            "json": true
        };

        winston.debug(`discordbots.org token: ${process.env.DISCORDBOTSORG_TOKEN}`);
        request(options, function requestCallback(err, httpResponse, body) {
            if (err) return winston.error(err);
            if (body) {
                winston.debug("DiscordBots.org results:");
                winston.debug(body);
            }
        });
    }

    // bots.discord.pw
    function sendBotsDiscordPWServerCount() {
        let options = {
            "method": "POST",
            "url": "https://bots.discord.pw/api/bots/388191157869477888/stats",
            "headers": {
                "cache-control": "no-cache",
                "authorization": process.env.BOTSDISCORDPW_TOKEN
            },
            "body": {
                "server_count": client.guilds.size
            },
            "json": true
        };

        winston.debug(`bots.discord.pw token: ${process.env.BOTSDISCORDPW_TOKEN}`);
        request(options, function requestCallback(err, httpResponse, body) {
            if (err) return winston.error(err);
            if (body) {
                winston.debug("Bots.Discord.pw results:");
                winston.debug(body);
            }
        });
    }

    // bots.discordlist.net
    function sendDiscordlistServerCount() {
        winston.debug(`bots.discordlist.net token: ${process.env.DISCORDLIST_TOKEN}`);
        request({
            "url": "https://bots.discordlist.net/api",
            "method": "POST",
            "json": true,
            "body": {
                "servers": client.guilds.size,
                "token": process.env.DISCORDLIST_TOKEN
            }
        }, function requestCallback(err, httpResponse, body) {
            if (err) return winston.error(err);
            if (body) {
                winston.debug("Discordlist results:");
                winston.debug(body);
            }
        });
    }

    updateServerCount();
});

client.on("guildCreate", () => {
    // Bot joins a new server
    updateServerCount();
});

client.on("guildDelete", () => {
    // Bot leaves a server
    updateServerCount();
});

// Log in the bot
client.login(process.env.BOT_TOKEN);