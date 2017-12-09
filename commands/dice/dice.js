const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const moneyAPI = require("../../moneyAPI");

module.exports = class DiceGame extends Command {
    constructor(client) {
        super(client, {
            name: "dice",
            group: "util",
            memberName: "dice",
            description: "Check a user's balance",
            aliases: ["game", "play", "play-game"],
            examples: ["dice ", "balance @PizzaFox#0075"],
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
        } else if (wager > moneyAPI.getBalance(rules["houseID"])) {
            return msg.reply(`❌ Your wager must be less than \`${moneyAPI.getBalance(rules["houseID"])}\` dots.`);
        } else if (wager > moneyAPI.getBalance(msg.author.id)) {
            return msg.reply(`❌ You need to have at least \`${wager}\`. Your balance is \`${moneyAPI.getBalance(msg.author.id)}\`.`);
        }

        // Variable setup
        let winPercentage = (100 / multiplier) / (100 - rules["houseEdgePercentage"]);
        let success;

        // Calculate number
        function getRandomFromRange(min, max) {
            return Math.random() * (max - min) + min;
        }


        if (success === false) {
            return msg.reply(`❌ You lost \`${wager}\` dots. Your balance is now \`${moneyAPI.getBalance(msg.author.id)}\`.`);
        } else {
            moneyAPI.updateBalance;
            return msg.reply(`💰 You won \`${wager * multiplier}\` dots! Your balance is now \`${moneyAPI.getBalance(msg.author.id)}\`.`);
        }

    }
};