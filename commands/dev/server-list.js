const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");

module.exports = class ServerListCommand extends Command {
    constructor(client) {
        super(client, {
            name: "server-list",
            group: "dev",
            memberName: "server-list",
            description: `List all servers <@${rules["houseID"]}> is on`,
            details: "Only the bot owner(s) may use this command.",
            aliases: ["list-servers", "guild-list", "list-guilds"],
            examples: ["server-list"],
            throttling: {
                usages: 2,
                duration: 30
            },
            ownerOnly: true
        });
    }

    run(msg) {
        const guilds = this.client.guilds;
        let guildList = [];
        for (let value of guilds.values()) {
            guildList.push(`${value.name} (${value.id})`);
        }

        for (const item of guildList) {
            msg.say(item);
        }

        return msg.reply(`👥 Finished! ${guilds.size} servers in total.`);
    }
};