const {
    Command
} = require("discord.js-commando");
const sqlite3 = require('sqlite3').verbose();

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

    run(msg, { user }) {
        let balancesDB = new sqlite3.Database("../../balances.db")

        if (user !== "msg author") {
            // Check who's balance we are checking
            return msg.reply(`WIP command`);
        }
    };
}