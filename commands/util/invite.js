const {
    Command,
} = require('discord.js-commando');
const rules = require('../../rules');

module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            group: 'util',
            memberName: 'invite',
            description: `Generates an invite link for <@${rules.houseID}>`,
            examples: ['invite'],
        });
    }

    run(msg) {
        msg.reply(`👋 https://discord.now.sh/${rules.houseID}?p3072`);
    }
};