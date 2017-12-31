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
                parse: amountString => diceAPI.simpleStringFormat(amountString)
            }],
            throttling: {
                usages: 2,
                duration: 30
            },
            ownerOnly: true
        });
    }

    async run(msg, {
        amount
    }) {
        const beforeTransferHouseBalance = await diceAPI.getBalance(rules["houseID"]);

        // Amount checking
        if (amount < rules["minWager"]) {
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` ${rules[currencyPlural]}.`);
        } else if (amount > beforeTransferHouseBalance) {
            return msg.reply(`❌ Your amount must be less than \`${beforeTransferHouseBalance}\`. <@${rules["houseID"]}> doesn't have that much.>`);
        } else if (isNaN(amount)) {
            return msg.reply(`❌ \`${amount}\` is not a valid number.`);
        }

        // Round to whole number
        amount = Math.round(amount);

        // Remove dots from the house
        diceAPI.decreaseBalance(rules["houseID"], amount);

        // Add dots to author
        diceAPI.increaseBalance(msg.author.id, amount);

        // Tell the sender
        return msg.reply(`📤 Cashed out \`${amount}\` dots to your account.`);
    }
};