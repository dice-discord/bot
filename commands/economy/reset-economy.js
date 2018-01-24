const { Command } = require('discord.js-commando');
const winston = require('winston');
const diceAPI = require('../../diceAPI');

module.exports = class ResetEconomyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reset-economy',
			group: 'economy',
			memberName: 'reset-economy',
			description: 'Reset the entire economy',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['destroy-eco', 'destroy-economy', 'economy-destroy', 'eco-destroy', 'reset-eco'],
			examples: ['reset-economy'],
			throttling: {
				usages: 2,
				duration: 30,
			},
			ownerOnly: true,
		});
	}

	run(msg) {
		const randomNumber = parseInt(Math.random() * (100 - 10) + 10);
		msg.reply(`⚠ **Are you absolutely sure you want to destroy all user profiles?** ⚠\n
		To proceed, enter \`${randomNumber}\`.\n
		The command will automatically be cancelled in 30 seconds.`);

		// Only allow messages containing the verification number that are by the message author
		const filter = verificationMessage => msg.author.id === verificationMessage.author.id;

		// Create message collector for verification
		const collector = msg.channel.createMessageCollector(filter, {
			max: 2,
			maxProcessed: 2,
			time: 30000,
		});

		// Message passed through all filters
		collector.on('collect', m => {
			if (m.id === msg.author.id && m.content.includes(randomNumber)) {
				winston.info(`Verification passed (collected message: ${m.content}, wiping database.`);
				// Start resetting the economy
				msg.reply('💣 Resetting the economy.');
				diceAPI.resetEconomy().then(() => {
					// Once the promise is fulfilled (when it's finished) respond to the user that it's done
					return msg.reply('🔥 Finished resetting the economy.');
				});
			}
		});
		collector.on('end', collected => {
			if (collected.size < 2) {
				return msg.reply('Cancelled command.');
			}
		});
	}
};
