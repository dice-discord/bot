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
                type: "string"
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
        if (!msg.author.isOwner) {
            return msg.reply("❌ You must be an owner to use this command.");
        }

        // Amount checking
        if (amount < rules["minWager"]) {
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` dots.`);
        }

        // No sending money to bots
        if (user.bot === true) {
            return msg.reply("❌ You can't send dots to bots.");
        }

        // Round to whole number
        amount = Math.round(amount);

        // Add dots to receiver
        diceAPI.increaseBalance(user.id, parseInt(amount));

        // Tell the sender
        return msg.reply(`📥 Added \`${amount}\` dots to <@${user.id}>'s account.`);
    }
};