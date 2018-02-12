// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const diceAPI = require('../../providers/diceAPI');

module.exports = class BalanceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'balance',
			group: 'economy',
			memberName: 'balance',
			description: 'Check a user\'s balance',
			aliases: ['bal', 'balance-check', 'bal-check', 'credits'],
			examples: ['balance', 'balance @PizzaFox#0075'],
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
			const houseBalance = await diceAPI.getBalance(rules.houseID);
			let userBalance;

			// Bot checking
			if (user.bot && user.id !== rules.houseID) {
				return msg.reply('❌ Bots can\'t play.');
			}

			if (user) {
				userBalance = await diceAPI.getBalance(user.id);

				// Someone else's balance
				if (houseBalance < userBalance && user.id !== rules.houseID) {
					return msg.reply(`🏦 ${user.tag}'s account has a balance of \`${userBalance}\` ${rules.currencyPlural}. That's more than ${this.client.user}!`);
				} else {
					return msg.reply(`🏦 ${user.tag}'s account has a balance of \`${userBalance}\` ${rules.currencyPlural}.`);
				}
			} else {
				userBalance = await diceAPI.getBalance(msg.author.id);

				// We are looking up the message author's balance
				if (houseBalance < userBalance && user.id !== rules.houseID) {
					return msg.reply(`🏦 You have a balance of \`${userBalance}\` ${rules.currencyPlural}. That's more than ${this.client.user}!`);
				} else {
					return msg.reply(`🏦 You have a balance of \`${userBalance}\` ${rules.currencyPlural}.`);
				}
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
