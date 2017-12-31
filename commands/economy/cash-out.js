const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class CashOutCommand extends Command {
    constructor(client) {
        super(client, {
            name: "cash-out",
            group: "economy",
            memberName: "cash-out",
            description: "Cash out money from the house.",
            details: "Only the bot owner(s) may use this command.",
            examples: ["cash-out 500"],
            args: [{
                key: "amount",
                prompt: "How many dots do you want to remove?",
                type: "string",
                // Convert string to number and round it
                parse: amountString => Math.round(parseInt(amountString))
            }],
            throttling: {
                usages: 2,
                duration: 30
            }
        });
    }

    run(msg, {
        amount
    }) {
        // Permission checking
        if (msg.author.isOwner === false) {
            return msg.reply("❌ You must be an owner to use this command.");
        }

        // Wager checking
        if (amount < rules["minWager"]) {
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` ${rules[currencyPlural]}.`);
        } else if (isNaN(amount)) {
            return msg.reply(`❌ \`${amount}\` is not a valid number.`);
        }

        // Round to whole number
        amount = Math.round(amount);

        // Remove dots from bank
        diceAPI.decreaseBalance(rules["houseID"], amount);

        // Add dots to author
        diceAPI.increaseBalance(msg.author.id, amount);

        // Tell the sender
        return msg.reply(`📤 Cashed out \`${amount}\` dots to your account.`);
    }
};