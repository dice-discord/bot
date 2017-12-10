const packageData = require("../../package");
const {
    Command
} = require("discord.js-commando");

module.exports = class CheckVersionCommand extends Command {
    constructor(client) {
        super(client, {
            name: "check-version",
            group: "dev",
            memberName: "check-version",
            description: "Checks what version <@388191157869477888> is.",
            aliases: ["version-check", "version"],
            autoAliases: true,
            examples: ["check-version"],
        });
    }

    run(msg) {
        return msg.reply(`<@388191157869477888> version ${packageData["version"]}.`);
    }
};