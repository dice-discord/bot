const {
    Command
} = require("discord.js-commando");

module.exports = class InviteDice extends Command {
    constructor(client) {
        super(client, {
            name: "invite",
            group: "util",
            memberName: "invite",
            description: "Generates an invite link for <@388191157869477888>",
            examples: ["invite"],
        });
    }

    run(msg) {
        client.generateInvite(['SEND_MESSAGES', 'READ_MESSAGES'])
            .then(link => {
                msg.reply(link);
            });
    }
};