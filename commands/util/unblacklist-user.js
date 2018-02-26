// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');

module.exports = class UnblacklistUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unblacklist-user',
			aliases: ['unblacklist', 'remove-blacklist-user', 'remove-blacklist'],
			group: 'util',
			memberName: 'unblacklist-user',
			description: 'Remove a user from the blacklist',
			throttling: {
				usages: 2,
				duration: 3
			},
			ownerOnly: true,
			args: [{
				key: 'user',
				prompt: 'Who do you want to remove from the blacklist?',
				type: 'user'
			}]
		});
	}

	run(msg, { user }) {
		// Get all of this guild's selfroles
		const blacklist = this.client.provider.get('global', 'blacklist', []);

		// Check if the role isn't a self role
		if (!blacklist.includes(user.id)) return msg.reply('❌ That user isn\'t blacklisted.');

		// Find the position of the role and delete it from the array
		blacklist.splice(blacklist.indexOf(user.id));
		// Set the array to our updated version
		this.client.provider.set(global, 'blacklist', blacklist);

		// React with the success emoji
		msg.react('406965554629574658');
		return null;
	}
};
