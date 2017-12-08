//Copyright 2017 Jonah Snider

// Set up dependencies
const {
    CommandoClient
} = require("discord.js-commando");
const path = require("path");
const sqlite = require('sqlite').verbose();

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
        ["dev", "Developer"]
    ])

    // Registers all built-in groups, commands, and argument types
    .registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, "commands"));

// Save settings in SQLite database
client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3'))
        .then(db => new Commando.SQLiteProvider(db))
);

client.on("ready", () => {
    console.log("Logged in!");

    // Set game presence to the help command once loaded
    client.user.setPresence({
        game: {
            name: "@Dice help",
            type: 0
        }
    });
});



// Log in the bot
client.login(process.env.BOT_TOKEN);