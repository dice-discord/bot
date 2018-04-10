// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const config = require('../../config');
const diceAPI = require('../../providers/diceAPI');

module.exports = class BalanceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'balance',
			group: 'economy',
			memberName: 'balance',
			description: 'Check a user\'s balance.',
			aliases: ['bal', 'balance-check', 'bal-check', 'credits'],
			examples: ['balance', 'balance @PizzaFox', 'balance zoop'],
			args: [{
				key: 'user',
				prompt: 'Who\'s balance do you want to check?',
				type: 'user',
				default: ''
			}],
			throttling: {
				usages: 2,
				duration: 10
			}
		});
	}

	async run(msg, { user }) {
		try {
			msg.channel.startTyping();
			const houseBalance = await diceAPI.getBalance(this.client.user.id);
			let userBalance;

			// Bot checking
			if(user.bot && user.id !== this.client.user.id) {
				return msg.reply('❌ Bots can\'t play.');
			}

			if(user) {
				userBalance = await diceAPI.getBalance(user.id);

				// Someone else's balance
				if(houseBalance < userBalance && user.id !== this.client.user.id) {
					// eslint-disable-next-line max-len
					return msg.reply(`🏦 ${user.tag}'s account has a balance of \`${userBalance.toLocaleString()}\` ${config.currency.plural}. That's more than ${this.client.user}!`);
				} else {
					// eslint-disable-next-line max-len
					return msg.reply(`🏦 ${user.tag}'s account has a balance of \`${userBalance.toLocaleString()}\` ${config.currency.plural}.`);
				}
			} else {
				userBalance = await diceAPI.getBalance(msg.author.id);

				// We are looking up the message author's balance
				if(houseBalance < userBalance && user.id !== this.client.user.id) {
					// eslint-disable-next-line max-len
					return msg.reply(`🏦 You have a balance of \`${userBalance.toLocaleString()}\` ${config.currency.plural}. That's more than ${this.client.user}!`);
				} else {
					return msg.reply(`🏦 You have a balance of \`${userBalance.toLocaleString()}\` ${config.currency.plural}.`);
				}
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
