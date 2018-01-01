//Copyright 2018 Jonah Snider

// Set up dependencies
const {
    CommandoClient
} = require("discord.js-commando");
const path = require("path");
const winston = require("winston");
const packageData = require("./package");
const rules = require("./rules");

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

client.on("ready", () => {
    winston.level = "debug";
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
});

client.on("message", (msg) => {
    winston.verbose("New message. Checking if author is a beta tester already");
    if (!msg.member.roles.has("396945953497808896") && packageData["version"].includes("beta") && !msg.author.bot && msg.content.startsWith("$") && msg.guild.id === "388366947689168897") {
        winston.verbose("Author isn't a beta tester. Adding role.");
        msg.member.addRole("396945953497808896", "Participated in the beta testing of Dice")
            .then(() => {
                winston.verbose(`Added beta tester role to ${msg.author.tag}`);
                msg.reply(`Thanks for testing out <@${rules["houseID"]}> during the beta. I've automatically given you the beta tester role as a thank you.`);
            });
    }
});

// Log in the bot
client.login(process.env.BOT_TOKEN);