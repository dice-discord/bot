const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class DiceGame extends Command {
    constructor(client) {
        super(client, {
            name: "dice-game",
            group: "util",
            memberName: "dice-game",
            description: "For each bet the outcome is randomly chosen between 1x and 100x. It's up to you to guess a target that you think the outcome will exceed.",
            aliases: ["game", "play", "play-game", "dice"],
            examples: ["dice 250 4"],
            args: [{
                key: "wager",
                prompt: "How much do you want to wager?",
                type: "string"
            }, {
                key: "multiplier",
                prompt: "How much do you want to multiply your wager by?",
                type: "string"
            }]
        });
    }

    run(msg, {
        wager,
        multiplier
    }) {
        // Multiplier checking
        if (multiplier < rules["minMultiplier"]) {
            return msg.reply(`❌ Your target multiplier must be at least \`${rules["minMultiplier"]}\`.`);
        } else if (multiplier > rules["maxMultiplier"]) {
            return msg.reply(`❌ Your target multiplier must be less than \`${rules["maxMultiplier"]}\`.`);
        }

        // Wager checking
        if (wager < rules["minWager"]) {
            return msg.reply(`❌ Your wager must be at least \`${rules["minWager"]}\` dots.`);
        } else if (wager > diceAPI.getBalance(rules["houseID"])) {
            return msg.reply(`❌ Your wager must be less than \`${diceAPI.getBalance(rules["houseID"])}\` dots.`);
        } else if (wager > diceAPI.getBalance(msg.author.id)) {
            return msg.reply(`❌ You are missing \`${wager - diceAPI.getBalance(msg.author.id)}\` dots. Your balance is \`${diceAPI.getBalance(msg.author.id)}\` dots.`);
        }

        // Round numbers to second decimal place
        let randomNumber = (Math.random() * 100).toFixed(2);
        multiplier = (multiplier).toFixed(2);

        // Round wager to whole number
        wager = Math.round(wager);

        success = (randomNumber < diceAPI.winPercentage(multiplier));

        // Take away the player's wager no matter what
        diceAPI.updateBalance(msg.author.id, diceAPI.getBalance(msg.author.id) - wager);
        // Give the wager to the house
        diceAPI.updateBalance(rules["houseID"], diceAPI.getBalance(rules["houseID"]) + wager);

        if (success === false) {
            responseEmbed
                .addField("Result", `❌ You lost \`${wager * multiplier}\` dots.`)
                .setColor("#f44334");
        } else {
            // Give the player their winnings
            diceAPI.updateBalance(msg.author.id, diceAPI.getBalance(msg.author.id) + (wager * multiplier));
            // Take the winnings from the house
            diceAPI.updateBalance(rules["houseID"], diceAPI.getBalance(rules["houseID"]) - (wager * multiplier));

            responseEmbed
                .addField("Result", `💰 You won \`${wager * multiplier}\` dots!`)
                .setColor("#4caf50");
        }



        const responseEmbed = {
            "title": `\`${wager}\` 🇽 \`${multiplier}\``,
            "fields": [
                {
                    "name": "Random Number Result",
                    "value": `\`${randomNumber}\``,
                    "inline": true
                },
                {
                    "name": "Updated Balance",
                    "value": `\`${diceAPI.getBalance(msg.author.id)}\` dots`,
                    "inline": true
                },
                {
                    "name": "Wager",
                    "value": "500",
                    "inline": true
                },
                {
                    "name": "Multiplier",
                    "value": "2.00x",
                    "inline": true
                }
            ]
        };
        return msg.channel.send({
            responseEmbed
        });

    }
};