const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const winston = require("winston");
const diceAPI = require("../../diceAPI");

module.exports = class DiceGameCommand extends Command {
    constructor(client) {
        super(client, {
            name: "dicegame",
            group: "dice",
            memberName: "dicegame",
            description: "For each bet the outcome is randomly chosen between 1 and 100. It's up to you to guess a target that you think the outcome will exceed.",
            aliases: ["game", "play", "play-game", "dice", "play-dice", "dice-game"],
            examples: ["dice 250 4"],
            args: [{
                key: "wager",
                prompt: "How much do you want to wager?",
                type: "string",
                // Round wager to whole number by converting to int
                parse: wagerString => parseInt(wagerString)
            }, {
                key: "multiplier",
                prompt: "How much do you want to multiply your wager by?",
                type: "string",
                // Round multiplier to second decimal place
                // Convert multiplier string to float, and convert toFixed string into float
                parse: multiplierString => parseFloat(parseFloat(multiplierString).toFixed(2))
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
        if (multiplier < parseInt(rules["minMultiplier"].toFixed(2))) {
            return msg.reply(`❌ Your target multiplier must be at least \`${rules["minMultiplier"]}\`.`);
        } else if (multiplier > parseInt(rules["maxMultiplier"].toFixed(2))) {
            return msg.reply(`❌ Your target multiplier must be less than \`${rules["maxMultiplier"]}\`.`);
        }

        // Wager checking
        if (wager < rules["minWager"]) {
            return msg.reply(`❌ Your wager must be at least \`${rules["minWager"]}\` ${rules["currencyPlural"]}.`);
        } else if (wager > diceAPI.getBalance(msg.author.id)) {
            return msg.reply(`❌ You are missing \`${wager - diceAPI.getBalance(msg.author.id)}\` ${rules["currencyPlural"]}. Your balance is \`${diceAPI.getBalance(msg.author.id)}\` ${rules["currencyPlural"]}.`);
        } else if ((wager * multiplier) > diceAPI.getBalance(rules["houseID"])) {
            return msg.reply("❌ I couldn't pay your winnings if you won.");
        }

        // Round numbers to second decimal place
        let randomNumber = parseInt((Math.random() * 100).toFixed(2));

        // Get boolean if the random number is less than the multiplier
        let success = (randomNumber < diceAPI.winPercentage(multiplier));

        // Take away the player's wager no matter what
        diceAPI.decreaseBalance(msg.author.id, wager);
        // Give the wager to the house
        diceAPI.increaseBalance(rules["houseID"], wager);

        // Variables for later use in embed
        let color;
        let result;

        if (success === false) {
            // Red color and loss message
            color = 0xf44334;
            result = `You lost \`${wager}\` ${rules["currencyPlural"]}.`;
        } else {
            // Give the player their winnings
            diceAPI.increaseBalance(msg.author.id, (wager * multiplier));
            // Take the winnings from the house
            diceAPI.decreaseBalance(rules["houseID"], (wager * multiplier));

            // Green color and win message
            color = 0x4caf50;
            result = `You made \`${(wager * multiplier) - wager}\` ${rules["currencyPlural"]} of profit!`;
        }

        msg.channel.send({
            embed: {
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
                    "name": "🏦 Updated Balance",
                    "value": `${diceAPI.getBalance(msg.author.id)} ${rules["currencyPlural"]}`,
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