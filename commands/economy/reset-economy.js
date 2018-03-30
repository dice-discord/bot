// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const winston = require('winston');
const diceAPI = require('../../providers/diceAPI');

module.exports = class ResetEconomyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reset-economy',
			group: 'economy',
			memberName: 'reset-economy',
			description: 'Reset the entire economy.',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['destroy-eco', 'destroy-economy', 'economy-destroy', 'eco-destroy', 'reset-eco'],
			throttling: {
				usages: 2,
				duration: 30
			},
			ownerOnly: true
		});
	}

	run(msg) {
		const randomNumber = parseInt((Math.random() * (100 - 10)) + 10);
		msg.reply(`⚠ **Are you absolutely sure you want to destroy all user profiles?** ⚠\n
		To proceed, enter \`${randomNumber}\`.\n
		The command will automatically be cancelled in 30 seconds.`).then(() => {
			const filter = message => msg.author.id === message.author.id;

			msg.channel.awaitMessages(filter, { time: 30000, maxMatches: 1, errors: ['time'] })
				.then(messages => {
					if(messages.first().content.includes(randomNumber)) {
						// eslint-disable-next-line max-len
						winston.info(`[COMMAND](DAILY) Verification passed (collected message: ${messages.first().content}, wiping database.`);
						// Start resetting the economy
						msg.reply('💣 Resetting the economy.');
						diceAPI.resetEconomy().then(() =>
							// Once the promise is fulfilled (when it's finished) respond to the user that it's done
							msg.reply('💥 Finished resetting the economy.')
						);
					}
				})
				.catch(() => msg.reply('Cancelled command.'));
		});
	}
};
