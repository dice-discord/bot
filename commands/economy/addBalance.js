const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class AddBalance extends Command {
    constructor(client) {
        super(client, {
            name: "addbalance",
            group: "economy",
            memberName: "addbalance",
            description: "Add dots to another user's account",
            aliases: ["add", "add-bal", "increase-balance", "increase-bal"],
            examples: ["add-balance 500 @Dice"],
            args: [{
                key: "amount",
                prompt: "How many dots do you want to add?",
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
                prompt: "Who do you want to add dots to?",
                type: "user",
                validate: user => {
                    if (user.bot === true && user.id !== 388191157869477888) {
                        return "❌ You can't send dots to bots.";
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

        // Add dots to user
        diceAPI.increaseBalance(user.id, amount);

        // Tell the sender
        return msg.reply(`📥 Added \`${amount}\` dots to <@${user.id}>'s account.`);
    }
};