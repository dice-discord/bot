const {
    Command
} = require("discord.js-commando");
const diceAPI = require("../../diceAPI");

module.exports = class CheckBalanceAPICommand extends Command {
    constructor(client) {
        super(client, {
            name: "simplebalance",
            group: "scriptapi",
            memberName: "simplebalance",
            description: "Get a plaintext response of a user's balance",
            aliases: ["api-bal", "api-balance-check", "api-bal-check", "api-simplebal"],
            examples: ["simplebal", "simplebal @PizzaFox#0075"],
            args: [{
                key: "user",
                prompt: "Who's balance do you want to check?",
                type: "user",
                default: ""
            }],
            throttling: {
                usages: 4,
                duration: 10
            }
        });
    }

    run(msg, {
        user
    }) {
        user = user || msg.user;
        if (user == msg.user) {
            // We are looking up the message author's balance
            return msg.channel.send(diceAPI.getBalance(msg.author.id));
        } else {
            // Someone else's balance
            return msg.channel.send(diceAPI.getBalance(user.id));
        }

        
    }
};