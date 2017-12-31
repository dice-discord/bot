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
                parse: amountString => diceAPI.simpleStringFormat(amountString)
            }, {
                key: "user",
                prompt: "Who do you want to add dots to?",
                type: "user"
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
        } else if (user.bot === true && user.id !== rules["houseID"]) {
            return msg.reply("❌ You can't add dots to bots.");
        }

        // Amount checking
        if (amount < rules["minWager"]) {
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` ${rules["currencySingular"]}.`);
        } else if (isNaN(amount)) {
            return msg.reply(`❌ \`${amount}\` is not a valid number.`);
        }

        // Add dots to user
        diceAPI.increaseBalance(user.id, amount);

        // Tell the author
        return msg.reply(`📥 Added \`${amount}\` ${rules["currencyPlural"]} to <@${user.id}>'s account.`);
    }
};