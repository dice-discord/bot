const { Command } = require('discord.js-commando');
const diceAPI = require('../../diceAPI');

module.exports = class ResetEconomyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reset-economy',
			group: 'economy',
			memberName: 'reset-economy',
			description: 'Reset the entire economy',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['destroy-eco', 'destroy-economy', 'economy-destroy', 'eco-destroy'],
			examples: ['reset-economy'],
			throttling: {
				usages: 2,
				duration: 30,
			},
			ownerOnly: true,
		});
	}

	run(msg) {
		// Start resetting the economy
		msg.reply('💣 Resetting the economy.');
		diceAPI.resetEconomy().then(() => {
			// Once the promise is fulfilled (when it's finished) respond to the user that it's done
			return msg.reply('🔥 Finished resetting the economy.');
		});
	}
};
