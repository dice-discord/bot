// Copyright Jonah Snider 2018

const winston = require('winston');
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

	async run(msg, { user }) {
		const blacklist = this.client.provider.get('global', 'blacklist', []);
		winston.debug('[COMMAND](BLACKLIST-USER) Blacklist from provider (will be empty if result is empty array):', blacklist);

		if (user) {
			if (this.client.isOwner(user.id)) return msg.reply('The bot owner can not be blacklisted.');

			if (blacklist.includes(user.id)) return msg.reply('That user is already blacklisted.');

			blacklist.push(user.id);
			await this.client.provider.set('global', 'blacklist', blacklist);

			// React with the success emoji
			msg.react('406965554629574658');
		} else if (blacklist.length > 0) {
			winston.debug('[COMMAND](BLACKLIST-USER) Blacklisted users:', blacklist);
			return msg.reply(`All blacklisted users:\n${blacklist.join('\n')}`);
		} else {
			return msg.reply('No blacklisted users.');
		}
	}
};
