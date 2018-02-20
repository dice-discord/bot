// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');
const winston = require('winston');

module.exports = class FortniteStatisticsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fortnite-statistics',
			group: 'games',
			memberName: 'fortnite-statistics',
			description: 'Get statistics of a Fortnite player',
			details: 'Platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).',
			aliases: ['fortnite-stats', 'fortnite'],
			examples: ['fortnite-statistics Zaccubus pc', 'fortnite-stats "WBG Strafesh0t" pc'],
			throttling: {
				usages: 1,
				duration: 10
			},
			args: [{
				key: 'platform',
				prompt: 'What platform do you want to search on?',
				type: 'string',
				parse: platform => platform.toLowerCase()
			}, {
				key: 'username',
				prompt: 'What user do you want to look up?',
				type: 'string'
			}]
		});
	}

	async run(msg, { platform, username }) {
		try {
			msg.channel.startTyping();

			const platforms = ['pc', 'xbl', 'psn'];
			if (!platforms.includes(platform)) {
				return msg.reply('❌ Unknown platform. The platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).');
			}

			const options = {
				uri: `https://api.fortnitetracker.com/v1/profile/${platform}/${username}`,
				json: true,
				headers: {
					'TRN-Api-Key': process.env.FORTNITETN_TOKEN
				}
			};
			const stats = await rp(options);

			if (stats.error === 'Player Not Found') {
				return msg.reply('❌ Player not found on that platform.');
			}

			winston.debug(`[COMMAND](FORTNITE-STATISTICS) Result for ${username} on ${platform}: ${JSON.stringify(stats)}`);
			return msg.replyEmbed({
				title: stats.epicUserHandle,
				url: `https://fortnitetracker.com/profile/${platform}/${username}`,
				fields: [{
					name: '🏆 Wins',
					value: `${stats.lifeTimeStats[8].value} wins (${stats.lifeTimeStats[9].value})`
				}, {
					name: '💀 Kills',
					value: `${stats.lifeTimeStats[10].value} kills. ${stats.lifeTimeStats[11].value} K/D ratio. ${stats.lifeTimeStats[12].value} kills per minute.`
				}, {
					name: '🕒 Time Played',
					value: stats.lifeTimeStats[13].value
				}, {
					name: '⏲ Average Survival Time',
					value: stats.lifeTimeStats[14].value
				}, {
					name: '🎮 Matches Played',
					value: stats.lifeTimeStats[7].value
				}, {
					name: '🔢 Score',
					value: stats.lifeTimeStats[6].value
				}]
			});
		} finally {
			msg.channel.stopTyping();
		}

	}
};
