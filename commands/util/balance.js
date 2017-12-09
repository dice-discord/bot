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
        if (user == ":msg author:") {
            // We are looking up the message author's balance
            if (moneyAPI.getBalance(rules["houseID"]) < moneyAPI.getBalance(msg.author.id) && user.id !== rules["houseID"]) {
                return msg.reply(`🏦 You have a balance of \`${moneyAPI.getBalance(msg.author.id)}\` dots. That's more than the bank!`);
            } else {
                return msg.reply(`🏦 You have a balance of \`${moneyAPI.getBalance(msg.author.id)}\` dots.`);
            }
        } else {
            // Someone else's balance
            if (moneyAPI.getBalance(rules["houseID"]) < moneyAPI.getBalance(user.id) && user.id !== rules["houseID"]) {
                return msg.reply(`🏦 ${user.tag}'s account has a balance of \`${moneyAPI.getBalance(user.id)}\` dots. That's more than the bank!`);
            } else {
                return msg.reply(`🏦 ${user.tag}'s account has a balance of \`${moneyAPI.getBalance(user.id)}\` dots.`);
            }
        }

        
    }
};