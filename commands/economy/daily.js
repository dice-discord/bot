// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const config = require('../../config');
const diceAPI = require('../../providers/diceAPI');
const moment = require('moment');
const winston = require('winston');
const DBL = require('dblapi.js');

module.exports = class DailyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'daily',
			group: 'economy',
			memberName: 'daily',
			description: `Collect your daily ${config.currency.plural}.`,
			aliases: ['dailies'],
			throttling: {
				usages: 1,
				duration: 3
			}
		});
	}

	async run(msg) {
		try {
			msg.channel.startTyping();

			// Initialize variables
			const oldTime = await diceAPI.getDailyUsed(msg.author.id);
			const currentTime = msg.createdTimestamp;
			const dbl = new DBL(config.discordBotsListToken);
			const voteStatus = await dbl.hasVoted(msg.author.id).catch(error => {
				winston.error('[COMMAND](DAILY) Error in discordbots.org vote checking', error.stack);
				return false;
			});
			// 23 hours because it's better for users to have some wiggle room
			const fullDay = 82800000;
			const waitDuration = moment.duration(oldTime - currentTime + fullDay).humanize();

			let payout = 1000;
			let note;

			winston.debug(`[COMMAND](DAILY) DBL vote status for ${msg.author.tag}: ${voteStatus}`);
			if(voteStatus) {
				payout *= 2;
				// eslint-disable-next-line max-len
				note = `You got double your payout from voting for ${this.client.user} today. Use ${msg.anyUsage('vote')} to vote once per day.`;
			} else {
				// eslint-disable-next-line max-len
				note = `You can double your payout from voting for ${this.client.user} each day. Use ${msg.anyUsage('vote')} to vote once per day.`;
			}

			// eslint-disable-next-line max-len
			winston.debug(`[COMMAND](DAILY) @${msg.author.tag} You must wait ${waitDuration} before collecting your daily ${config.currency.plural}.`);
			winston.debug(`[COMMAND](DAILY) Old timestamp: ${new Date(oldTime)} (${oldTime})`);
			winston.debug(`[COMMAND](DAILY) Current timestamp: ${new Date(currentTime)} (${currentTime})`);

			if(oldTime + fullDay < currentTime || oldTime === false) {
				if(oldTime === false) {
					winston.verbose('[COMMAND](DAILY) Old timestamp was returned as false, meaning empty in the database.');
				}

				// Pay message author their daily
				await diceAPI.increaseBalance(msg.author.id, payout);
				// Save the time their daily was used
				await diceAPI.setDailyUsed(msg.author.id, currentTime);
				// Pay Dice the same amount to help handle the economy
				diceAPI.increaseBalance(this.client.user.id, payout);

				// Daily not collected in one day
				const message = `You were paid ${payout} ${config.currency.plural}`;
				if(note) {
					return msg.reply(`${message}\n${note}`);
				} else {
					return msg.reply(message);
				}
			} else {
				// Daily collected in a day or less (so, recently)
				// eslint-disable-next-line max-len
				return msg.reply(`🕓 You must wait ${waitDuration} before collecting your daily ${config.currency.plural}. Remember to vote each day and get double ${config.currency.plural}. Use ${msg.anyUsage('vote')}.`);
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
