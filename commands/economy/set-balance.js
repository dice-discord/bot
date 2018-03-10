// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const diceAPI = require('../../providers/diceAPI');
const rules = require('../../rules');
const response = require('../../providers/simpleCommandResponse');

module.exports = class SetBalanceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'set-balance',
			group: 'economy',
			memberName: 'set-balance',
			description: 'Set a user\'s balance',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['set-bal', 'set-balance'],
			examples: ['set-balance 500 @Dice'],
			args: [
				{
					key: 'amount',
					prompt: 'What do you want the new balance to be?',
					type: 'float',
					parse: amount => diceAPI.simpleFormat(amount),
					min: rules.minWager
				},
				{
					key: 'user',
					prompt: 'Who\'s balance do you want to set?',
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
			await diceAPI.updateBalance(user.id, amount);

			// Respond to author with success
			response.respond(msg);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
