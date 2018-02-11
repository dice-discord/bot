// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const diceAPI = require('../../diceAPI');
const rules = require('../../rules');
const winston = require('winston');

module.exports = class LeaderboardCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'wins-leaderboard',
			group: 'util',
			memberName: 'wins-leaderboard',
			description: 'Shows a top ten leaderboard of who had the most profitable games',
			aliases: ['top-games', 'top-wins', 'leaderboard-wins', 'wins-top'],
			examples: ['wins-leaderboard'],
			ownerOnly: true
		});
	}

	async run(msg) {
		try {
			msg.channel.startTyping();

			const leaderboardArray = await diceAPI.topWinsLeaderboard();

			winston.verbose(`[COMMAND](WINS-LEADERBOARD) Contents of top wins leaderboard array: ${leaderboardArray}`);
			winston.verbose(`[COMMAND](WINS-LEADERBOARD) Top wins leaderboard array length: ${leaderboardArray.length}`);

			// Check if there are enough games to populate the embed
			if (leaderboardArray.length < 10) {
				return msg.reply('❌ There are less than 10 wins total.');
			}

			const botClient = this.client;

			const userTagFromID = arrayPlace => {
				const targetID = leaderboardArray[arrayPlace].id;
				winston.debug(`[COMMAND](WINS-LEADERBOARD) Checking user tag from array index ${arrayPlace}`);
				return botClient.users.fetch(targetID).tag;
			};

			return msg.reply({
				embed: {
					title: 'Top 10 Biggest Wins Leaderboard',
					fields: [
						{
							name: `#1 ${await userTagFromID(0)}`,
							value: `${leaderboardArray[0].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#2 ${await userTagFromID(1)}`,
							value: `${leaderboardArray[1].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#3 ${await userTagFromID(2)}`,
							value: `${leaderboardArray[2].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#4 ${await userTagFromID(3)}`,
							value: `${leaderboardArray[3].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#5 ${await userTagFromID(4)}`,
							value: `${leaderboardArray[4].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#6 ${await userTagFromID(5)}`,
							value: `${leaderboardArray[5].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#7 ${await userTagFromID(6)}`,
							value: `${leaderboardArray[6].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#8 ${await userTagFromID(7)}`,
							value: `${leaderboardArray[7].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#9 ${await userTagFromID(8)}`,
							value: `${leaderboardArray[8].biggestWin} ${rules.currencyPlural}`
						},
						{
							name: `#10 ${await userTagFromID(9)}`,
							value: `${leaderboardArray[9].biggestWin} ${rules.currencyPlural}`
						}
					]
				}
			});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
