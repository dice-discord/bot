const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class RemoveBalanceCommand extends Command {
    constructor(client) {
        super(client, {
            name: "remove-balance",
            group: "economy",
            memberName: "remove-balance",
            description: "Remove dots from another user's account",
            details: "Only the bot owner(s) may use this command.",
            aliases: ["remove", "remove-bal", "decrease-balance", "decrease-bal", "lower", "lower-bal", "reduce", "reduce-bal"],
            examples: ["remove-balance 500 @Dice"],
            args: [{
                key: "amount",
                prompt: "How many dots do you want to remove?",
                type: "string"
            }, {
                key: "user",
                prompt: "Who do you want to remove dots from?",
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

        // Wager checking
        if (amount < rules["minWager"]) {
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` ${rules["currencyPlural"]}.`);
        } else if (isNaN(amount)) {
            return msg.reply(`❌ \`${amount}\` is not a valid number.`);
        }

        // Remove dots from user
        diceAPI.decreaseBalance(user.id, amount);

        // Tell the author
        return msg.reply(`📤 Removed \`${amount}\` dots from <@${user.id}>'s account.`);
    }
};