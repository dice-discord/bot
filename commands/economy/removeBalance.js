const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class RemoveBalance extends Command {
    constructor(client) {
        super(client, {
            name: "removebalance",
            group: "economy",
            memberName: "removebalance",
            description: "Remove dots from another user's account",
            aliases: ["remove", "remove-bal", "decrease-balance", "decrease-bal", "lower", "lower-bal", "reduce", "reduce-bal"],
            examples: ["remove-balance 500 @Dice"],
            args: [{
                key: "amount",
                prompt: "How many dots do you want to remove?",
                type: "string",
                validate: amount => {
                    if (amount < rules["minWager"]) {
                        return `❌ Your amount must be at least \`${rules["minWager"]}\` ${rules[currencyPlural]}.`;
                    }
                    return true;
                },
                // Convert string to number and round it
                parse: amountString => Math.round(parseInt(amountString))
            }, {
                key: "user",
                prompt: "Who do you want to remove dots from?",
                type: "user",
                validate: user => {
                    if (user.bot === true && user.id !== 388191157869477888) {
                        return "❌ You can't remove dots from bots.";
                    }
                    return true;
                },
            }],
            throttling: {
                usages: 2,
                duration: 30
            }
        });
    }

    run(msg, {
        user,
        amount
    }) {
        // Permission checking
        if (msg.author.isOwner === false) {
            return msg.reply("❌ You must be an owner to use this command.");
        }

        /*// Amount checking
        if (amount < rules["minWager"]) {
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` dots.`);
        }*/

        // No removing money from bots
        /*if (user.bot === true) {
            return msg.reply("❌ You can't remove dots from bots.");
        }*/

        // Round to whole number
        amount = Math.round(amount);

        // Add dots to receiver
        diceAPI.decreaseBalance(user.id, parseInt(amount));

        // Tell the sender
        return msg.reply(`📤 Removed \`${amount}\` dots from <@${user.id}>'s account.`);
    }
};