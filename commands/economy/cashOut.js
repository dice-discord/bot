const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class RemoveBalance extends Command {
    constructor(client) {
        super(client, {
            name: "cashout",
            group: "economy",
            memberName: "cashout",
            description: "Cash out money from the house.",
            aliases: ["cash-out"],
            examples: ["cash-out 500 @Pizza Fox#0075"],
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

        // Round to whole number
        amount = Math.round(amount);

        // Remove dots from bank
        diceAPI.decreaseBalance(rules["houseID"], amount);

        // Add dots to author
        diceAPI.increaseBalance(msg.author.id, amount);

        // Tell the sender
        return msg.reply(`📤 Cash out \`${amount}\` dots to <@${user.id}>'s account.`);
    }
};