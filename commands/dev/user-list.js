const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");
const winston = require("winston");

module.exports = class UserListCommand extends Command {
    constructor(client) {
        super(client, {
            name: "user-list",
            group: "dev",
            memberName: "user-list",
            description: `List all users of <@${rules["houseID"]}>`,
            details: "Only the bot owner(s) may use this command.",
            aliases: ["list-users"],
            examples: ["user-list"],
            throttling: {
                usages: 2,
                duration: 30
            },
            ownerOnly: true
        });
    }

    async run(msg) {
        const userIDs = await diceAPI.allUsers();
        const client = this.client;

        function userTagFromID(arrayPlace) {
            winston.debug(`Checking user tag from array index ${arrayPlace}`);
            if (client.users.get(userIDs[arrayPlace]["id"])) {
                return client.users.get(userIDs[arrayPlace]["id"]).tag;
            } else {
                return "User left server";
            }
        }

        for (let index = 0; index < userIDs.length; index++) {
            msg.say(`${userTagFromID(index)} (${userIDs[index]["id"]})`);
        }

        return msg.reply(`👤 ${await diceAPI.totalUsers()} users in total.`);
    }
};