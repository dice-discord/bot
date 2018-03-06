// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const diceAPI = require('../../providers/diceAPI');

module.exports = class AddBalanceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'add-balance',
			group: 'economy',
			memberName: 'add-balance',
			description: 'Add oats to another user\'s account',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['add-bal', 'increase-balance', 'increase-bal'],
			examples: ['add-balance 500 @Dice'],
			args: [
				{
					key: 'amount',
					prompt: 'How many oats do you want to add?',
					type: 'float',
					min: rules.minWager,
					parse: amount => diceAPI.simpleFormat(amount)
				},
				{
					key: 'user',
					prompt: 'Who do you want to add oats to?',
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
		try {
			msg.channel.startTyping();
			// Permission checking
			if (user.bot === true && user.id !== this.client.user.id) {
				return msg.reply('❌ You can\'t add oats to bots.');
			}

			// Add oats to user
			await diceAPI.increaseBalance(user.id, amount);

			// React with the success emoji
			msg.react('406965554629574658');
			return null;
		} finally {
			msg.channel.stopTyping();
		}
	}
};
