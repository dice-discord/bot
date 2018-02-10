// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const rules = require('../../rules');

module.exports = class InviteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'invite',
			group: 'util',
			memberName: 'invite',
			description: `An invite link for <@${rules.houseID}>`,
			examples: ['invite']
		});
	}

	run(msg) {
		msg.reply(`👋 https://discord.now.sh/${this.client.user.id}?p265280`);
	}
};
