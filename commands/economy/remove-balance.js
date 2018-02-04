const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const diceAPI = require('../../diceAPI');

module.exports = class RemoveBalanceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'remove-balance',
			group: 'economy',
			memberName: 'remove-balance',
			// prettier-ignore
			description: 'Remove dots from another user\'s account',
			details: 'Only the bot owner(s) may use this command.',
			aliases: [
				'remove',
				'remove-bal',
				'decrease-balance',
				'decrease-bal',
				'lower',
				'lower-bal',
				'reduce',
				'reduce-bal',
			],
			examples: ['remove-balance 500 @Dice'],
			args: [
				{
					key: 'amount',
					prompt: 'How many dots do you want to remove?',
					type: 'float',
					parse: amount => diceAPI.simpleFormat(amount),
				},
				{
					key: 'user',
					prompt: 'Who do you want to remove dots from?',
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

	run(msg, { user, amount }) {
		// Permission checking
		if (user.bot === true && user.id !== rules.houseID) {
			// prettier-ignore
			return msg.reply('❌ You can\'t remove dots from bots.');
		}

		// Wager checking
		if (amount < rules.minWager) {
			return msg.reply(
				`❌ Your amount must be at least \`${rules.minWager}\` ${rules.currencyPlural}.`
			);
		}

		// Remove dots from user
		diceAPI.decreaseBalance(user.id, amount);

		// Tell the author
		return msg.reply(
			`📤 Removed \`${amount}\` ${rules.currencyPlural} from <@${user.id}>'s account.`
		);
	}
};
