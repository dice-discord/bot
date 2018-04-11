// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise-native');
const winston = require('winston');
const config = require('../../config');
const platforms = ['pc', 'xbl', 'psn'];

module.exports = class FortniteStatisticsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fortnite-statistics',
			group: 'games',
			memberName: 'fortnite-statistics',
			description: 'Get statistics of a Fortnite player.',
			details: 'Platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).',
			aliases: ['fortnite-stats', 'fortnite'],
			examples: ['fortnite-statistics pc Zaccubus', 'fortnite-stats pc "WBG Strafesh0t"'],
			clientPermissions: ['EMBED_LINKS'],
			throttling: {
				usages: 1,
				duration: 10
			},
			args: [{
				key: 'platform',
				prompt: 'What platform do you want to search on?',
				type: 'string',
				parse: platform => platform.toLowerCase(),
				oneOf: platforms
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

			const options = {
				uri: `https://api.fortnitetracker.com/v1/profile/${platform}/${username}`,
				json: true,
				headers: { 'TRN-Api-Key': config.fortniteTrackerNetworkToken }
			};
			const stats = await rp(options).catch(error => {
				winston.error('[COMMAND](FORTNITE-STATISTICS)', error.stack);
				return msg.reply('❌ There was an error with the API we use (https://api.fortnitetracker.com)');
			});

			if(stats.error === 'Player Not Found') {
				return msg.reply('❌ Player not found on that platform.');
			}

			winston.debug(`[COMMAND](FORTNITE-STATISTICS) Result for ${username} on ${platform}: ${JSON.stringify(stats)}`);
			return msg.replyEmbed({
				title: stats.epicUserHandle,
				url: `https://fortnitetracker.com/profile/${platform}/${encodeURIComponent(username)}`,
				footer: { text: 'Information provided by the Tracker Network' },
				fields: [{
					name: '🏆 Wins',
					value: `${stats.lifeTimeStats[8].value || '0'} wins (${stats.lifeTimeStats[9].value || '0'})`
				}, {
					name: '💀 Kills',
					// eslint-disable-next-line max-len
					value: `${stats.lifeTimeStats[10].value || '0'} kills. ${stats.lifeTimeStats[11].value || '0'} K/D ratio. ${stats.lifeTimeStats[12].value || '0'} kills per minute.`
				}, {
					name: '🎮 Matches Played',
					value: stats.lifeTimeStats[7].value || '0'
				}, {
					name: '🔢 Score',
					value: stats.lifeTimeStats[6].value || '0'
				}]
			});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
