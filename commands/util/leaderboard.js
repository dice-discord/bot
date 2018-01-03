const {
    Command
} = require("discord.js-commando");
const {
    RichEmbed
} = require('discord.js');
const diceAPI = require("../../diceAPI");
const rules = require("../../rules");
const winston = require("winston");

module.exports = class LeaderboardCommand extends Command {
    constructor(client) {
        super(client, {
            name: "leaderboard",
            group: "util",
            memberName: "leaderboard",
            description: `Shows a top ten leaderboard of who has the most ${rules["currencyPlural"]}`,
            aliases: ["top-10", "top-ten", "chart", "top"],
            examples: ["leaderboard"],
        });
    }

    async run(msg) {
        winston.level = "debug";

        const leaderboardArray = await diceAPI.leaderboard();

        winston.verbose(`Contents of leaderboard array: ${leaderboardArray}`);
        winston.verbose(`Leaderboard array length: ${leaderboardArray.length}`);

        // Check if there are enough users to populate the embed
        if (leaderboardArray.length < 10) {
            return msg.reply("❌ There are less than 10 users total.");
        }

        let botClient = this.client;

        function userTagFromID(arrayPlace) {
            winston.debug(`Checking user tag from array index ${arrayPlace}`);
            if (botClient.users.get(leaderboardArray[arrayPlace]["id"])) {
                return botClient.users.get(leaderboardArray[arrayPlace]["id"]).tag;
            } else {
                return "User left server";
            }
        }

        return msg.reply({
            embed: {
                "title": "Top 10 Leaderboard",
                "fields": [{
                        "name": `#1 ${userTagFromID(0)}`,
                        "value": `${leaderboardArray[0]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#2 ${userTagFromID(1)}`,
                        "value": `${leaderboardArray[1]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#3 ${userTagFromID(2)}`,
                        "value": `${leaderboardArray[2]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#4 ${userTagFromID(3)}`,
                        "value": `${leaderboardArray[3]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#5 ${userTagFromID(4)}`,
                        "value": `${leaderboardArray[4]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#6 ${userTagFromID(5)}`,
                        "value": `${leaderboardArray[5]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#7 ${userTagFromID(6)}`,
                        "value": `${leaderboardArray[6]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#8 ${userTagFromID(7)}`,
                        "value": `${leaderboardArray[7]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#9 ${userTagFromID(8)}`,
                        "value": `${leaderboardArray[8]["balance"]} ${rules["currencyPlural"]}`
                    },
                    {
                        "name": `#10 ${userTagFromID(9)}`,
                        "value": `${leaderboardArray[9]["balance"]} ${rules["currencyPlural"]}`
                    }
                ]
            }
        });
    }
};