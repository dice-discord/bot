// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const rp = require('request-promise');
const winston = require('winston');
const replaceall = require('replaceall');

module.exports = class OverwatchStatisticsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'overwatch-statistics',
			group: 'games',
			memberName: 'overwatch-statistics',
			description: 'Get statistics of an Overwatch player',
			details: 'Platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).',
			aliases: ['overwatch-stats', 'overwatch', 'ow-statistics', 'ow-stats', 'ow'],
			examples: ['overwatch-statistics cats#11481 pc us'],
			throttling: {
				usages: 1,
				duration: 4
			},
			args: [{
				key: 'battletag',
				prompt: 'What user do you want to look up?',
				type: 'string',
				parse: battletag => replaceall('#', '-', battletag)
			}, {
				key: 'platform',
				prompt: 'What platform do you want to search on?',
				type: 'string',
				parse: platform => platform.toLowerCase()
			}, {
				key: 'region',
				prompt: 'What region do you want to get statistics from?',
				type: 'string',
				parse: region => region.toLowerCase()
			}]
		});
	}

	async run(msg, { battletag, platform, region }) {
		try {
			msg.channel.startTyping();

			const platforms = ['pc', 'xbl', 'psn'];
			const regions = ['us', 'eu', 'asia'];
			if (!platforms.includes(platform)) {
				return msg.reply('❌ Unknown platform. The platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).');
			}
			if (!regions.includes(region)) {
				return msg.reply('❌ Unknown region. The regions are `us` (United States of America), `eu` (Europe), and `asia` (Asia)');
			}
			if (!battletag.includes('-')) {
				return msg.reply(`❌ Unknown battletag. Use ${msg.anyUsage('help overwatch-statistics')} for information on how to use this command.`);
			}

			const options = {
				uri: `https://ow-api.com/v1/stats/${platform}/${region}/${battletag}/profile`,
				json: true
			};
			const stats = await rp(options).catch(error => {
				winston.error('[COMMAND](OVERWATCH-STATISTICS)', error.stack);
				return msg.reply('❌ There was an error with the API we use (https://ow-api.com)');
			});

			if (stats.error === 'The requested player was not found') {
				return msg.reply('❌ That user couldn\'t be found.');
			} else if (stats.error) {
				winston.error('[COMMAND](OVERWATCH-STATISTICS) Unknown error from API', stats);
				return msg.reply(`❌ There was an error with the API we use (https://ow-api.com). The error that was sent: ${stats.error}`);
			}

			winston.debug(`[COMMAND](OVERWATCH-STATISTICS) Result for ${battletag} on ${platform}: ${JSON.stringify(stats)}`);

			const embed = new MessageEmbed({
				author: {
					name: stats.name,
					url: 'https://ow-api.com',
					iconURL: stats.icon
				}
			});

			// Rating icon
			if (stats.ratingIcon) {
				embed.setThumbnail(stats.ratingIcon);
			}

			// Games won
			if (stats.gamesWon && stats.quickPlayStats.games.won && stats.competitiveStats.games) {
				embed.addField('🏆 Games Won', `${stats.gamesWon} total wins (${stats.quickPlayStats.games.won} from quick play and ${stats.competitiveStats.games.won} from competitive)`);
			} else if (stats.gamesWon && stats.quickPlayStats.games.won) {
				embed.addField('🏆 Games Won', `${stats.gamesWon} total wins`);
			}

			// Average eliminations
			if (stats.quickPlayStats.eliminationsAvg && stats.competitiveStats.eliminationsAvg) {
				embed.addField('💀 Average Eliminations', `${stats.quickPlayStats.eliminationsAvg} eliminations from quick play and ${stats.competitiveStats.eliminationsAvg} from competitive`);
			} else if (stats.quickPlayStats.eliminationsAvg) {
				embed.addField('💀 Average Eliminations', `${stats.quickPlayStats.eliminationsAvg} eliminations from quick play`);
			}

			// Games Played
			if (stats.quickPlayStats.games.played && stats.competitiveStats.games.played) {
				embed.addField('🎮 Games Played', `${stats.quickPlayStats.games.played + stats.competitiveStats.games.played} games played total (${stats.quickPlayStats.games.played} from quick play and ${stats.competitiveStats.games.played} from competitive)`);
			} else if (stats.quickPlayStats.games.played) {
				embed.addField('🎮 Games Played', `${stats.quickPlayStats.games.played} games played total`);
			}

			// Quick play medals
			if (stats.quickPlayStats.awards.medals) {
				embed.addField('🏅 Medals (Quick Play)', `${stats.quickPlayStats.awards.medals} medals total.\n🥇 ${stats.quickPlayStats.awards.medalsGold} gold medals\n🥈 ${stats.quickPlayStats.awards.medalsSilver} silver medals\n🥉 ${stats.quickPlayStats.awards.medalsBronze} bronze medals`);
			}

			// Competitive medals
			if (stats.competitiveStats.awards.medals) {
				embed.addField('🏅 Medals (Competitive)', `${stats.competitiveStats.awards.medals} medals total.\n🥇 ${stats.competitiveStats.awards.medalsGold} gold medals\n🥈 ${stats.competitiveStats.awards.medalsSilver} silver medals\n🥉 ${stats.competitiveStats.awards.medalsBronze} bronze medals`);
			}

			// Cards
			if (stats.competitiveStats.awards.cards && stats.quickPlayStats.awards.cards) {
				embed.addField('🃏 Cards', `${stats.competitiveStats.awards.cards + stats.quickPlayStats.awards.cards} total cards (${stats.quickPlayStats.awards.cards} from quick play, ${stats.competitiveStats.awards.cards} from competitive)`, true);
			}
			return msg.replyEmbed(embed);
		} finally {
			msg.channel.stopTyping();
		}

	}
};
