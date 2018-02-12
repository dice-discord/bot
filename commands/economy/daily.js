// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const rules = require('../../rules');
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
			description: `Collect your daily ${rules.currencyPlural}`,
			aliases: ['dailies'],
			examples: ['daily'],
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
			const dbl = new DBL(process.env.DISCORDBOTSORG_TOKEN);
			// 23 hours because it's better for users to have some wiggle room
			const fullDay = 82800000;
			const waitDuration = moment.duration(oldTime - currentTime + fullDay).humanize();
			const serverID = '388366947689168897';

			const inviter = rules.rewardRoles[0];
			const backer = rules.rewardRoles[1];
			const recruiter = rules.rewardRoles[2];
			const affiliate = rules.rewardRoles[3];

			let payout = 1000;
			let note;

			// Bonuses for referring users

			if (msg.member.roles.has(affiliate.id) && msg.guild.id === serverID) {
				payout = payout * affiliate.multiplier;
				note = `You got double the regular amount for being an **${affiliate.name}** from inviting 25+ users.`;
			} else if (msg.member.roles.has(recruiter.id) && msg.guild.id === serverID) {
				payout = payout * recruiter.multiplier;
				note = `You got a ${(recruiter.multiplier - 1) * 100}% bonus for being a **${recruiter.name}** from inviting 10+ users.`;
			} else if (msg.member.roles.has(backer.id) && msg.guild.id === serverID) {
				payout = payout * backer.multiplier;
				note = `You got a ${(backer.multiplier - 1) * 100}% bonus for being a **${backer.name}** from inviting 5+ users.`;
			} else if (msg.member.roles.has(inviter.id) && msg.guild.id === serverID) {
				payout = payout * inviter.multiplier;
				note = `You got a ${(inviter.multiplier - 1) * 100}% bonus for being a **${inviter.name}** from inviting 1+ users.`;
			}

			if (dbl.hasVoted(msg.author.id)) {
				payout = payout * 2;
				note = `${note}\nYou got double your payout from voting for ${this.client.user} today. Use ${msg.anyUsage('vote')} to vote once per day.`;
			} else {
				note = `${note}\nYou can double your payout from voting for ${this.client.user} each day. Use ${msg.anyUsage('vote')} to vote once per day.`;
			}

			winston.debug(`[COMMAND](DAILY) @${msg.author.tag} You must wait ${waitDuration} before collecting your daily ${rules.currencyPlural}.`);
			winston.debug(`[COMMAND](DAILY) Old timestamp: ${new Date(oldTime)} (${oldTime})`);
			winston.debug(`[COMMAND](DAILY) Current timestamp: ${new Date(currentTime)} (${currentTime})`);

			if (oldTime + fullDay < currentTime || oldTime === false) {
				if (oldTime === false) {
					winston.verbose('[COMMAND](DAILY) Old timestamp was returned as false, meaning empty in the database.');
				}

				// Pay message author their daily
				await diceAPI.increaseBalance(msg.author.id, payout);
				// Save the time their daily was used
				await diceAPI.setDailyUsed(msg.author.id, currentTime);
				// Pay Dice the same amount to help handle the economy
				diceAPI.increaseBalance(this.client.user.id, payout);

				// Daily not collected in one day
				const message = `You were paid ${payout} ${rules.currencyPlural}`;
				if (note) {
					return msg.reply(`${message}\n${note}`);
				} else {
					return msg.reply(message);
				}
			} else {
			// Daily collected in a day or less (so, recently)
				return msg.reply(`🕓 You must wait ${waitDuration} before collecting your daily ${rules.currencyPlural}.`);
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
