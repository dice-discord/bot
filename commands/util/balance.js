const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const moneyAPI = require("../../moneyAPI");

module.exports = class BalanceCheck extends Command {
    constructor(client) {
        super(client, {
            name: "balance",
            group: "util",
            memberName: "balance",
            description: "Check a user's balance",
            aliases: ["bal", "balance-check", "bal-check"],
            examples: ["balance", "balance @PizzaFox#0075"],
            args: [{
                key: "user",
                prompt: "Who's balance do you want to check?",
                type: "user",
                default: ":msg author:"
            }]
        });
    }

    run(msg, {
        user
    }) {
        // Figure out who's balance we are looking up
        let targetUserID = user.id;
        if (user == ":msg author:") {
            // We are looking up the message author's balance
            targetUserID = msg.author.id;
        }

        if (moneyAPI.getBalance(rules["houseID"]) < moneyAPI.getBalance(targetUserID)) {
            return message.reply(`🏦 You have a balance of \`${moneyAPI.getBalance(targetUserID)}\` dots. That's more than the bank!`);
        } else {
            return message.reply(`🏦 You have a balance of \`${moneyAPI.getBalance(targetUserID)}\` dots.`);
        }
    }
};