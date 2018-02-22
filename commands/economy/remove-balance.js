// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const diceAPI = require('../../providers/diceAPI');

module.exports = class RemoveBalanceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'remove-balance',
			group: 'economy',
			memberName: 'remove-balance',
			description: 'Remove dots from another user\'s account',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['remove-bal', 'decrease-balance', 'decrease-bal', 'lower-bal', 'reduce-bal'],
			examples: ['remove-balance 500 @Dice'],
			args: [{
				key: 'amount',
				prompt: 'How many dots do you want to remove?',
				type: 'float',
				parse: amount => diceAPI.simpleFormat(amount),
				min: rules.minWager
			},
			{
				key: 'user',
				prompt: 'Who do you want to remove dots from?',
				type: 'user'
			}
			],
			throttling: {
				usages: 2,
				duration: 30
			},
			ownerOnly: true
		});
	}

	async run(msg, { user, amount }) {
		// Permission checking
		if (user.bot === true && user.id !== this.client.user.id) {
			return msg.reply('❌ You can\'t remove dots from bots.');
		}

		// Remove dots from user
		await diceAPI.decreaseBalance(user.id, amount);

		// React with the success emoji
		msg.react('406965554629574658');
		return null;
	}
};
