const {
    Command
} = require("discord.js-commando");

module.exports = class AccountAgeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "accountage",
            group: "util",
            memberName: "accountage",
            description: "Check when your account was created",
            aliases: ["age", "account-created"],
            examples: ["accountage"]
        });
    }

    run(msg) {
        return msg.reply(`\`${msg.author.createdAt}\``);
    }
};