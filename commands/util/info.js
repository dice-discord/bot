const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: "info",
            group: "util",
            memberName: "info",
            description: "Get information on a user",
            aliases: ["user-info", "user-profile", "profile"],
            examples: ["info", "info PizzaFox"],
            args: [{
                key: "user",
                prompt: "Who's profile do you want to look up?",
                type: "user"
            }],
            throttling: {
                usages: 2,
                duration: 20
            },

        });
    }

    run(msg, {
        user
    }) {
        user = user || msg.user;

        msg.channel.send({
            embed: {
                "title": user.username,
                "thumbnail": user.displayAvatarURL,
                "fields": [{
                    "name": "💰 Total Profit",
                    "value": `${diceAPI.getBalance(msg.author.id) - rules["newUserBalance"]} ${rules["currencyPlural"]}`
                },
                {
                    "name": "🏦 Balance",
                    "value": `${diceAPI.getBalance(msg.author.id)} ${rules["currencyPlural"]}`,
                    "inline": true
                }
                ]
            }
        });
    }
};