// Copyright Jonah Snider 2018

const winston = require('winston');
const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class BlacklistUsersCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'blacklist-users',
			aliases: ['blacklist', 'blacklist-user'],
			group: 'util',
			memberName: 'blacklist-users',
			description: 'Prohibit a user from using the bot.',
			throttling: {
				usages: 2,
				duration: 3
			},
			ownerOnly: true,
			args: [{
				key: 'users',
				label: 'user',
				prompt: 'What users do you want to blacklist?',
				type: 'user',
				default: [],
				infinite: true
			}]
		});
	}

	async run(msg, { users }) {
		const blacklist = await this.client.provider.get('global', 'blacklist', []);
		// eslint-disable-next-line max-len
		winston.debug('[COMMAND](BLACKLIST-USER) Blacklist from provider (will be empty if result is empty array):', blacklist);

		if(users.length > 0) {
			let error = '';
			users.forEach(user => {
				if(this.client.isOwner(user.id)) {
					error += 'The bot owner can not be blacklisted.\n';
				} else if(blacklist.includes(user.id)) {
					error += `${user} is already blacklisted.\n`;
				} else {
					blacklist.push(user.id);
				}
			});

			if(error) return msg.reply(`${error}\nNo users were blacklisted.`, { split: true });

			await this.client.provider.set('global', 'blacklist', blacklist);

			// Respond to author with success
			respond(msg);

			return null;
		} else if(blacklist.length > 0) {
			winston.debug('[COMMAND](BLACKLIST-USER) Blacklisted users:', blacklist);
			return msg.reply(`All blacklisted users:\n${blacklist.join('\n')}`, { split: true });
		} else {
			return msg.reply('No blacklisted users.');
		}
	}
};
