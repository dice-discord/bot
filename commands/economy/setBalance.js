const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class SetBalance extends Command {
    constructor(client) {
        super(client, {
            name: "setbalance",
            group: "economy",
            memberName: "setbalance",
            description: "Set a user's balance",
            aliases: ["set", "set-bal", "set-balance"],
            examples: ["set-balance 500 @Dice"],
            args: [{
                key: "amount",
                prompt: "What do you want the new balance to be?",
                type: "string"
            }, {
                key: "user",
                prompt: "Who's balance do you want to set?",
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
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` ${rules["currencyPlural"]}.`);
        } else if (isNaN(amount)) {
            return msg.reply(`❌ \`${amount}\` is not a valid number.`);
        }

        // Convert string float to float (number)
        amount = diceAPI.simpleStringFormat(amount);

        // Add dots to user
        diceAPI.updateBalance(user.id, amount);

        // Tell the author
        return msg.reply(`💰 Set <@${user.id}>'s account balance to \`${amount}\` ${rules["currencyPlural"]}.`);
    }
};