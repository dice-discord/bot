const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class TransferDots extends Command {
    constructor(client) {
        super(client, {
            name: "transfer",
            group: "util",
            memberName: "transfer",
            description: "Tranfser dots to another user",
            aliases: ["send", "pay"],
            examples: ["transfer 500 @Dice"],
            args: [{
                key: "amount",
                prompt: "How many dots do you want to transfer?",
                type: "string"
            }, {
                key: "user",
                prompt: "Who do you want to transfer dots to?",
                type: "user"
            }]
        });
    }

    run(msg, {
        user,
        amount
    }) {
        // Amount checking
        if (amount < rules["minWager"]) {
            return msg.reply(`❌ Your amount must be at least \`${rules["minWager"]}\` dots.`);
        } else if (amount > diceAPI.getBalance(msg.author.id)) {
            return msg.reply(`❌ You need to have at least \`${amount}\`. Your balance is \`${diceAPI.getBalance(msg.author.id)}\`.`);
        }

        // No sending money to yourself
        if (msg.author.id === user.id) {
            return msg.reply("❌ You can't send money to yourself.");
        }

        // No sending money to bots
        if (user.bot === true) {
            return msg.reply("❌ You can't send dots to bots.");
        }

        // Round to whole number
        amount = Math.round(amount);

        // Remove dots from sender
        diceAPI.updateBalance(msg.author.id, diceAPI.getBalance(msg.author.id) - amount);

        // Add dots to receiver
        diceAPI.updateBalance(user.id, parseInt(amount) + diceAPI.getBalance(user.id));

        // Tell the receiver
        user.createDM().then(dmChannel => {
            dmChannel.send(`📥 <@${msg.author.id}> transferred  \`${amount}\` dots to you. You now have a balance of \`${diceAPI.getBalance(user.id)}\` dots.`);
        });

        // Tell the sender
        return msg.reply(`📤 Transferred \`${amount}\` dots to <@${user.id}>. You now have a balance of \`${diceAPI.getBalance(msg.author.id)}\` dots.`);
    }
};