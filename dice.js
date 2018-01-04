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

// Update server counter on bot listings

// Generic options for requests
const options = {
    "url": "https://bots.discord.pw/api/bots/388191157869477888/stats",
    "method": "POST",
    "headers": {
        "Authorization": process.env.BOTSDISCORDPW_TOKEN
    },
    "body": {
        "server_count": client.guilds.size || 0
    },
    "json": true
};

// discordbots.org
function sendDiscordBotsORGServerCount() {
    // Override global options
    options.url = "https://discordbots.org/api/bots/388191157869477888/stats";
    options.headers["Authorization"] = process.env.DISCORDBOTSORG_TOKEN;

    winston.debug(`discordbots.org token: ${process.env.DISCORDBOTSORG_TOKEN}`);
    request(options, function requestCallback(err, httpResponse, body) {
        winston.debug("DiscordBots.org results:");
        if (err) return winston.error(err);
        winston.debug(body);
    });
}

// bots.discord.pw
function sendBotsDiscordPWServerCount() {
    winston.debug(`bots.discord.pw token: ${process.env.BOTSDISCORDPW_TOKEN}`);
    request(options, function requestCallback(err, httpResponse, body) {
        winston.debug("Bots.Discord.pw results:");
        if (err) return winston.error(err);
        winston.debug(body);
    });
}

// bots.discordlist.net
function sendDiscordlistServerCount() {
    winston.debug(`bots.discordlist.net token: ${process.env.DISCORDLIST_TOKEN}`);
    request({
        "url": "https://bots.discordlist.net/api",
        "method": "POST",
        "token": process.env.DISCORDLIST_TOKEN,
        "servers": client.guilds.size
    }, function requestCallback(err, httpResponse, body) {
        winston.debug("Discordlist results:");
        if (err) return winston.error(err);
        winston.debug(body);
    });
}

// Run all three at once
function updateServerCount() {
    winston.verbose("Sending POST requests to bot listings.");
    /* No token for this yet
    sendDiscordBotsORGServerCount();*/
    sendBotsDiscordPWServerCount();
    sendDiscordlistServerCount();
}

client.on("ready", () => {
    winston.info("Logged in!");
    winston.verbose("Node.js version: " + process.version);
    winston.verbose(`Dice version v${packageData["version"]}`);
    // Set game presence to the help command once loaded
    client.user.setPresence({
        game: {
            name: "@Dice help",
            type: 0
        }
    });

    updateServerCount();
});

client.on("guildCreate", () => {
    updateServerCount();
});

// Log in the bot
client.login(process.env.BOT_TOKEN);