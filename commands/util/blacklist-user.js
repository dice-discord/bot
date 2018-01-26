const { Command } = require('discord.js-commando');
const diceAPI = require('../../diceAPI');

module.exports = class BlacklistUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'blacklist-user',
			group: 'economy',
			memberName: 'blacklist-user',
			description: 'Add a user to the blacklist',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['block-user', 'user-blacklist', 'user-block', 'blacklist'],
			examples: ['blacklist @Dice'],
			args: [
				{
					key: 'user',
					prompt: 'Who do you want to blacklist?',
					type: 'user',
				},
			],
			throttling: {
				usages: 2,
				duration: 30,
			},
			ownerOnly: true,
		});
	}

	async run(msg, { user }) {
		await diceAPI.setBlacklistLevel(user.id, 1);

		// Tell the author
		return msg.reply(`🚫 Blacklisted ${user}.`);
	}
};
