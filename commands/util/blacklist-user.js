// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');

module.exports = class BlacklistUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'blacklist-user',
			aliases: ['blacklist'],
			group: 'util',
			memberName: 'blacklist-user',
			description: 'Prohibit a user from using the bot',
			throttling: {
				usages: 2,
				duration: 3
			},
			ownerOnly: true,
			args: [{
				key: 'user',
				prompt: 'Who do you want to blacklist?',
				type: 'user',
				default: ''
			}]
		});
	}

	run(msg, { user }) {
		const blacklist = this.client.provider.get('global', 'blacklist', []);

		if (user) {
			if (this.client.isOwner(user.id)) return msg.reply('The bot owner can not be blacklisted.');

			if (blacklist.includes(user.id)) return msg.reply('That user is already blacklisted.');

			blacklist.push(user.id);
			this.client.provider.set('global', 'blacklist', blacklist);

			// React with the success emoji
			msg.react('406965554629574658');
			return null;
		} else if (blacklist.length > 0) {
			return msg.reply(`All blacklisted users:\n${blacklist.join('\n')}`);
		} else {
			return msg.reply('No blacklisted users.');
		}
	}
};
