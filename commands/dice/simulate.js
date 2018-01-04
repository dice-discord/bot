const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const winston = require("winston");
const diceAPI = require("../../diceAPI");

module.exports = class SimulateGameCommand extends Command {
    constructor(client) {
        super(client, {
            name: "simulate",
            group: "dice",
            memberName: "simulate",
            description: "Simulate a game of dice",
            aliases: ["practice", "practice-game", "sim", "simulate-game", "sim-game", "simulate-dice", "sim-dice"],
            examples: ["simulate 250 4"],
            args: [{
                key: "wager",
                prompt: "How much do you want to wager?",
                type: "string",
                // Round wager by converting to simple string and then round
                parse: wagerString => Math.round(diceAPI.simpleStringFormat(wagerString))
            }, {
                key: "multiplier",
                prompt: "How much do you want to multiply your wager by?",
                type: "string",
                // Round multiplier to second decimal place
                parse: multiplierString => diceAPI.simpleStringFormat(multiplierString)
            }],
            throttling: {
                usages: 1,
                duration: 1
            },

        });
    }

    run(msg, {
        wager,
        multiplier
    }) {
        winston.level = "info";

        // Multiplier checking
        if (multiplier < diceAPI.simpleFormat(rules["minMultiplier"])) {
            return msg.reply(`❌ Your target multiplier must be at least \`${rules["minMultiplier"]}\`.`);
        } else if (multiplier > diceAPI.simpleFormat(rules["maxMultiplier"])) {
            return msg.reply(`❌ Your target multiplier must be less than \`${rules["maxMultiplier"]}\`.`);
        } else if (isNaN(multiplier)) {
            return msg.reply(`❌ \`${multiplier}\` is not a valid number.`);
        }

        // Wager checking
        if (wager < rules["minWager"]) {
            return msg.reply(`❌ Your wager must be at least \`${rules["minWager"]}\` ${rules["currencyPlural"]}.`);
        } else if (isNaN(wager)) {
            return msg.reply(`❌ \`${wager}\` is not a valid number.`);
        }

        // Round numbers to second decimal place
        let randomNumber = diceAPI.simpleFormat((Math.random() * rules["maxMultiplier"]));

        // Get boolean if the random number is greater than the multiplier
        let gameResult = randomNumber > diceAPI.winPercentage(multiplier);

        // Variables for later use in embed
        let color;
        let result;
        let profit = diceAPI.simpleFormat((wager * multiplier) - wager);

        if (gameResult === true) {
            // Red color and loss message
            color = 0xf44334;
            result = `You would have lost \`${wager}\` ${rules["currencyPlural"]}.`;
        } else {
            // Green color and win message
            color = 0x4caf50;
            result = `Your profit would have been \`${profit}\` ${rules["currencyPlural"]}!`;
        }

        msg.say({
            "embed": {
                "title": `**${wager} 🇽 ${multiplier}**`,
                "color": color,
                "fields": [{
                    "name": "🎲 Result",
                    "value": result
                }, {
                    "name": "🔢 Random Number Result",
                    "value": `${randomNumber}`,
                    "inline": true
                },
                {
                    "name": "📊 Win Chance",
                    "value": `${diceAPI.simpleFormat(diceAPI.winPercentage(multiplier))}%`,
                    "inline": true
                },
                {
                    "name": "💵 Wager",
                    "value": `${wager}`,
                    "inline": true
                },
                {
                    "name": "🇽 Multiplier",
                    "value": `${multiplier}`,
                    "inline": true
                }
                ]
            }
        });
    }
};