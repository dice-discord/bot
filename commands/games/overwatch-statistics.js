// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');
const winston = require('winston');
const replaceall = require('replaceall');

module.exports = class FortniteStatisticsCommand extends Command {
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
			const stats = await rp(options);
			const totalGamesPlayed = stats.quickPlayStats.games.played + stats.competitiveStats.games.played;
			const totalCards = stats.competitiveStats.awards.cards + stats.quickPlayStats.awards.cards;

			winston.debug(`[COMMAND](OVERWATCH-STATISTICS) Result for ${battletag} on ${platform}: ${JSON.stringify(stats)}`);
			return msg.replyEmbed({
				author: {
					name: stats.name,
					url: 'https://ow-api.com',
					iconURL: stats.icon
				},
				thumbnail: { url: stats.ratingIcon },
				fields: [{
					name: '🏆 Games Won',
					value: `${stats.gamesWon ? stats.gamesWon : 0} total wins (${stats.quickPlayStats.games.won ? stats.quickPlayStats.games.won : 0} from quick play, ${stats.competitiveStats.games.won ? stats.competitiveStats.games.won : 0} from competitive)`,
					inline: true
				}, {
					name: '💀 Average Eliminations',
					value: `${stats.quickPlayStats.eliminationsAvg ? stats.quickPlayStats.eliminationsAvg : 0} eliminations from quick play. ${stats.competitiveStats.eliminationsAvg ? stats.competitiveStats.eliminationsAvg : 0} from competitive.`,
					inline: true
				}, {
					name: '🎮 Games Played',
					value: `${totalGamesPlayed ? totalGamesPlayed : 0} games played total (${stats.quickPlayStats.games.played} from quick play, ${stats.competitiveStats.games.played} from competitive)`,
					inline: true
				}, {
					name: '🏅 Medals (Quick Play)',
					value: `${stats.quickPlayStats.awards.medals ? stats.quickPlayStats.awards.medals : 0} medals total.\n🥇 ${stats.quickPlayStats.awards.medalsGold ? stats.quickPlayStats.awards.medalsGold : 0} gold medals\n🥈 ${stats.quickPlayStats.awards.medalsSilver ? stats.quickPlayStats.awards.medalsSilver : 0} silver medals\n🥉 ${stats.quickPlayStats.awards.medalsBronze ? stats.quickPlayStats.awards.medalsBronze : 0} bronze medals`,
					inline: true
				}, {
					name: '🏅 Medals (Competitive)',
					value: `${stats.competitiveStats.awards.medals ? stats.competitiveStats.awards.medals : 0} medals total.\n🥇 ${stats.competitiveStats.awards.medalsGold ? stats.competitiveStats.awards.medalsGold : 0} gold medals\n🥈 ${stats.competitiveStats.awards.medalsSilver ? stats.competitiveStats.awards.medalsSilver : 0} silver medals\n🥉 ${stats.competitiveStats.awards.medalsBronze ? stats.competitiveStats.awards.medalsBronze : 0} bronze medals`,
					inline: true
				}, {
					name: '🃏 Cards',
					value: `${totalCards ? totalCards : 0} total cards (${stats.quickPlayStats.awards.cards ? stats.quickPlayStats.awards.cards : 0} from quick play, ${stats.competitiveStats.awards.cards ? stats.competitiveStats.awards.cards : 0} from competitive)`,
					inline: true
				}]
			});
		} finally {
			msg.channel.stopTyping();
		}

	}
};
