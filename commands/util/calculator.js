const rules = require("../../rules");
const diceAPI = require("../../");
const {
    Command
} = require("discord.js-commando");

module.exports = class WinCalculator extends Command {
    constructor(client) {
        super(client, {
            name: "calculator",
            group: "util",
            memberName: "calculator",
            description: "Calculate the odds of winning a game.",
            aliases: ["calc", "chance", "win-chance", "win-percentage", "percentage", "percent"],
            examples: ["calculator"],
            args: [{
                key: "multiplier",
                label: "multiplier",
                prompt: "How much do you want to multiply your wager by?",
                type: "string"
            }]
        });
    }

    run(msg, { multiplier }) {
        if (multiplier < rules["minMultiplier"]) {
            return msg.reply(`❌ Your target multiplier must be at least \`${rules["minMultiplier"]}\`.`);
        } else if (multiplier > rules["maxMultiplier"]) {
            return msg.reply(`❌ Your target multiplier must be less than \`${rules["maxMultiplier"]}\`.`);
        }
        
        return msg.reply(`Win Percentage: \`${diceAPI.winPercentage(multilpier)}%\`.`);
    }
};