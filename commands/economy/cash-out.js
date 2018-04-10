// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const config = require('../../config');
const diceAPI = require('../../providers/diceAPI');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class CashOutCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'cash-out',
			group: 'economy',
			memberName: 'cash-out',
			description: 'Cash out money from the house.',
			details: 'Only the bot owner(s) may use this command.',
			examples: ['cash-out 500'],
			args: [
				{
					key: 'amount',
					prompt: 'How many oats do you want to remove?',
					type: 'float',
					min: config.minWager,
					parse: amount => diceAPI.simpleFormat(amount)
				}
			],
			throttling: {
				usages: 2,
				duration: 30
			},
			ownerOnly: true
		});
	}

	async run(msg, { amount }) {
		const beforeTransferHouseBalance = await diceAPI.getBalance(this.client.user.id);

		// Amount checking
		if(amount > beforeTransferHouseBalance) {
			// eslint-disable-next-line max-len
			return msg.reply(`❌ Your amount must be less than \`${beforeTransferHouseBalance.toLocaleString()}\` ${config.currency.plural}. ${this.client.user} doesn't have that much.`);
		}

		// Round to whole number
		amount = Math.round(amount);

		// Remove oats from the house
		diceAPI.decreaseBalance(this.client.user.id, amount);

		// Add oats to author
		diceAPI.increaseBalance(msg.author.id, amount);

		// Respond to author with success
		respond(msg);

		return null;
	}
};
