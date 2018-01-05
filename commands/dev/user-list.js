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
        const database = await diceAPI.allUsers();
        const botClient = this.client;

        async function userTagFromID(arrayPlace) {
            const targetID = database[arrayPlace]["id"];
            winston.debug(`Checking user tag from array index ${arrayPlace}`);
            if (botClient.users.get(targetID)) {
                return await botClient.users.get(targetID).tag;
            } else {
                return await botClient.users.fetch(targetID).tag;
            }
        }

        for (let index = 0; index < database.length; index++) {
            msg.say(`${await userTagFromID(index)} (${database[index]["id"]})`);
        }

        return msg.reply(`👤 ${await diceAPI.totalUsers()} users in total.`);
    }
};