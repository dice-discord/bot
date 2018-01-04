const {
    Command
} = require("discord.js-commando");
const winston = require("winston");
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
                type: "user",
                default: ""
            }],
            throttling: {
                usages: 2,
                duration: 20
            },
        });
    }

    async run(msg, {
        user
    }) {
        winston.level = "debug";
        user = user || msg.author;
        const userBalance = await diceAPI.getBalance(user.id);
        const userProfilePicture = user.displayAvatarURL(128);
        let startingBalance;

        // Determine what the starting balance is for the requested user
        if (user.id === rules["houseID"]) {
            startingBalance = rules["houseStartingBalance"];
        } else if (user.bot && user.id !== rules["houseID"]) {
            return msg.reply("❌ Bots can't play.");
        } else {
            startingBalance = rules["newUserBalance"];
        }

        winston.verbose(`Target user display URL: ${userProfilePicture}`);

        return msg.say({
            embed: {
                "title": user.tag,
                "thumbnail": {
                    "url": userProfilePicture
                },
                "fields": [{
                        "name": "💰 Total Profit",
                        "value": `${diceAPI.simpleFormat(userBalance - startingBalance)} ${rules["currencyPlural"]}`,
                        "inline": true
                    },
                    {
                        "name": "🏦 Balance",
                        "value": `${userBalance} ${rules["currencyPlural"]}`,
                        "inline": true
                    }
                ]
            }
        });
    }
};