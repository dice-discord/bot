// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');
const winston = require('winston');
const replaceall = require('replaceall');

module.exports = class FortniteStatisticsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'overwatch-statistics',
			ownerOnly: true,
			group: 'games',
			memberName: 'overwatch-statistics',
			description: 'Get statistics of an Overwatch player',
			details: 'Platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).',
			aliases: ['overwatch-stats', 'overwatch'],
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
					value: `${stats.gamesWon} total wins (${stats.quickPlayStats.games.won} from quick play, ${stats.competitiveStats.games.won} from competitive)`
				}, {
					name: '💀 Average Eliminations',
					value: `${stats.quickPlayStats.eliminationsAvg} eliminations from quick play. ${stats.competitiveStats.eliminationsAvg} from competitive.`
				}]
			});
		} finally {
			msg.channel.stopTyping();
		}

	}
};
