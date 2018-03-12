// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const diceAPI = require('../../providers/diceAPI');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class ResetDailyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reset-daily',
			group: 'economy',
			memberName: 'reset-daily',
			description: 'Reset a user\'s last claimed daily timestamp.',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['reset-dailies', 'daily-reset', 'dailies-reset'],
			examples: ['reset-daily @Dice'],
			args: [{
				key: 'user',
				prompt: 'Who\'s wait time do you want to reset?',
				type: 'user',
				default: ''
			}],
			throttling: {
				usages: 2,
				duration: 30
			},
			ownerOnly: true
		});
	}

	async run(msg, { user }) {user = user || msg.author;

			// Permission checking
			if (user.bot === true) {
				return msg.reply('❌ You can\'t reset a bot\'s daily wait time.');
			}

			await diceAPI.setDailyUsed(user.id, false);

			// Respond to author with success
			respond(msg);
	}
};
