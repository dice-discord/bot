const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const diceAPI = require('../../diceAPI');

module.exports = class AddBalanceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'add-balance',
			group: 'economy',
			memberName: 'add-balance',

			description: 'Add dots to another user\'s account',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['add', 'add-bal', 'increase-balance', 'increase-bal'],
			examples: ['add-balance 500 @Dice'],
			args: [
				{
					key: 'amount',
					prompt: 'How many dots do you want to add?',
					type: 'float',
					parse: amount => diceAPI.simpleFormat(amount)
				},
				{
					key: 'user',
					prompt: 'Who do you want to add dots to?',
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

	run(msg, { user, amount }) {
		// Permission checking
		if (user.bot === true && user.id !== rules.houseID) {

			return msg.reply('❌ You can\'t add dots to bots.');
		}

		// Amount checking
		if (amount < rules.minWager) {

			return msg.reply(`❌ Your amount must be at least \`${rules.minWager}\` ${rules.currencySingular}.`);
		}

		// Add dots to user
		diceAPI.increaseBalance(user.id, amount);

		// Tell the author
		return msg.reply(`📥 Added \`${amount}\` ${rules.currencyPlural} to <@${user.id}>'s account.`);
	}
};
