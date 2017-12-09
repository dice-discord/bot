const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const moneyAPI = require("../../moneyAPI");

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
        } else if (amount > moneyAPI.getBalance(msg.author.id)) {
            return msg.reply(`❌ You need to have at least \`${amount}\`. Your balance is \`${moneyAPI.getBalance(msg.author.id)}\`.`);
        }

        // No sending money to yourself
        if (msg.author.id === user.id) {
            return msg.reply("❌ You can't send money to yourself.");
        }

        // Remove dots from sender
        moneyAPI.updateBalance(user.id, moneyAPI.getBalance(msg.author.id) - amount);

        // Add dots to receiver
        moneyAPI.updateBalance(user.id, amount + moneyAPI.getBalance(user.id));

        // Tell the receiver
        user.createDM().then(dmChannel => {
            dmChannel.send(`📥 <@${msg.author.id}> transferred  \`${amount}\` dots to you. You now have a balance of \`${moneyAPI.getBalance}\` dots.`);
        });

        // Tell the sender
        return msg.reply(`📤 Transferred \`${amount}\` dots to <@${user.id}>. You now have a balance of \`${moneyAPI.getBalance(msg.author.id)}\` dots.`);
    }
};