const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class DiceGame extends Command {
    constructor(client) {
        super(client, {
            name: "simulate",
            group: "dice",
            memberName: "simulate",
            description: "Simulate a game of dice",
            aliases: ["practice", "sim", "simulate-game", "sim-game", "simulate-dice", "sim-dice"],
            examples: ["simulate 250 4"],
            args: [{
                key: "wager",
                prompt: "How much do you want to pretend to wager?",
                type: "string"
            }, {
                key: "multiplier",
                prompt: "How much do you want to pretend to multiply your wager by?",
                type: "string"
            }]
        });
    }

    run(msg, {
        wager,
        multiplier
    }) {
        // Round multiplier to second decimal place
        multiplier = parseInt(multiplier).toFixed(2);

        // Round wager to whole number
        wager = Math.round(parseInt(wager));

        // Multiplier checking
        if (multiplier < rules["minMultiplier"].toFixed(2)) {
            return msg.reply(`❌ Your target multiplier must be at least \`${rules["minMultiplier"]}\`.`);
        } else if (multiplier > rules["maxMultiplier"].toFixed(2)) {
            return msg.reply(`❌ Your target multiplier must be less than \`${rules["maxMultiplier"]}\`.`);
        }

        // Wager checking
        if (wager < rules["minWager"]) {
            return msg.reply(`❌ Your wager must be at least \`${rules["minWager"]}\` dots.`);
        }

        // Round numbers to second decimal place
        let randomNumber = (Math.random() * 100).toFixed(2);

        // Get boolean if the random number is less than the multiplier
        let success = (randomNumber < diceAPI.winPercentage(multiplier));

        // Variables for later use in embed
        let color;
        let result;

        if (success === false) {
            // Red color and loss message
            color = 0xf44334;
            result = `You would have lost \`${wager}\` dots.`;
        } else {
            // Green color and win message
            color = 0x4caf50;
            result = `Your profit would have been \`${(wager * multiplier) - wager}\` dots!`;
        }

        msg.channel.send({
            embed: {
                "title": `\`${wager}\` 🇽 \`${multiplier}\``,
                "color": color,
                "fields": [{
                    "name": "🎲 Result",
                    "value": result
                }, {
                    "name": "🔢 Random Number Result",
                    "value": `\`${randomNumber}\``,
                    "inline": true
                },
                {
                    "name": "📊 Win Chance",
                    "value": `\`${diceAPI.winPercentage(multiplier)}\`%`,
                    "inline": true
                },
                {
                    "name": "💵 Wager",
                    "value": `\`${wager}\``,
                    "inline": true
                },
                {
                    "name": "🇽 Multiplier",
                    "value": `\`${multiplier}\``,
                    "inline": true
                }
                ]
            }
        });
    }
};