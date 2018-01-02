const {
    Command
} = require("discord.js-commando");
const diceAPI = require("../../diceAPI");
const rules = require("../../rules");

module.exports = class StatisticsCommand extends Command {
    constructor(client) {
        super(client, {
            name: "statistics",
            group: "util",
            memberName: "statistics",
            description: `Get statistics on <@${rules["houseID"]}>`,
            aliases: ["stats"],
            examples: ["statistics"],
            throttling: {
                usages: 2,
                duration: 20
            },
        });
    }

    async run(msg) {
        return msg.channel.send({
            embed: {
                "title": "Dice Statistics",
                "fields": [{
                        "name": "👥 Total Number of Users",
                        // Subtract one because of the Dice bot
                        "value": `${await diceAPI.totalUsers() - 1} users`,
                        "inline": true
                    }
                ]
            }
        });
    }
};