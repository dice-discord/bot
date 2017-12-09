const {
    Command
} = require("discord.js-commando");
const sqlite = require("sqlite");

module.exports = class BalanceCheck extends Command {
    constructor(client) {
        super(client, {
            name: "balance",
            group: "util",
            memberName: "balance",
            description: "Check a user's balance",
            aliases: ["bal", "balance-check", "bal-check"],
            examples: ["balance", "balance PizzaFox#0075"],
            args: [{
                key: "user",
                prompt: "Who's balance do you want to check?",
                type: "user",
                default: "msg author"
            }]
        });
    }

    run(msg, {
        user
    }) {
        // Open database
        sqlite.open("../../balances.sqlite3");

        let targetUserID = user.id;

        if (user == "msg author") {
            // Message author's balance
            targetUserID = msg.author.id;
        }

        // Select any value (there should just be one) where the ID is the same as the author of the message
        sqlite.get(`SELECT * FROM balances WHERE id ="${targetUserID}"`).then(row => {
            // If they don't have a balance, tell them it's 0
            if (!row) return message.reply("🏦 You have a balance of `0`.");
            // Get the row's value and tell them
            return message.reply(`🏦 You have a balance of \`${row.balance}\``);
        });
    }
};