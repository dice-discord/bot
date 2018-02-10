// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const diceAPI = require('../../diceAPI');
const rules = require('../../rules');
const winston = require('winston');

module.exports = class LeaderboardCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'leaderboard',
			group: 'util',
			memberName: 'leaderboard',
			description: `Shows a top ten leaderboard of who has the most ${rules.currencyPlural}`,
			aliases: ['top-10', 'top-ten', 'chart', 'top'],
			examples: ['leaderboard']
		});
	}

	async run(msg) {
		const leaderboardArray = await diceAPI.leaderboard();

		winston.verbose('[COMMAND](LEADERBOARD) Contents of leaderboard array:', leaderboardArray);
		winston.verbose(`[COMMAND](LEADERBOARD) Leaderboard array length: ${leaderboardArray.length}`);

		// Check if there are enough users to populate the embed
		if (leaderboardArray.length < 10) {
			return msg.reply('❌ There are less than 10 users total.');
		}

		const userTagFromID = async arrayPlace => {
			await this.client.users.fetch(leaderboardArray[arrayPlace].id);
			winston.debug(`[COMMAND](LEADERBOARD) Checking user tag from array index ${arrayPlace}`);
			const result = this.client.users.resolve(leaderboardArray[arrayPlace].id).tag;
			winston.debug(`[COMMAND](LEADERBOARD) Result for userTagFromID: ${result}`);
			return result;
		};

		return msg.reply({
			embed: {
				title: 'Top 10 Leaderboard',
				fields: [
					{
						name: `#1 ${await userTagFromID(0)}`,
						value: `${leaderboardArray[0].balance} ${rules.currencyPlural}`
					},
					{
						name: `#2 ${await userTagFromID(1)}`,
						value: `${leaderboardArray[1].balance} ${rules.currencyPlural}`
					},
					{
						name: `#3 ${await userTagFromID(2)}`,
						value: `${leaderboardArray[2].balance} ${rules.currencyPlural}`
					},
					{
						name: `#4 ${await userTagFromID(3)}`,
						value: `${leaderboardArray[3].balance} ${rules.currencyPlural}`
					},
					{
						name: `#5 ${await userTagFromID(4)}`,
						value: `${leaderboardArray[4].balance} ${rules.currencyPlural}`
					},
					{
						name: `#6 ${await userTagFromID(5)}`,
						value: `${leaderboardArray[5].balance} ${rules.currencyPlural}`
					},
					{
						name: `#7 ${await userTagFromID(6)}`,
						value: `${leaderboardArray[6].balance} ${rules.currencyPlural}`
					},
					{
						name: `#8 ${await userTagFromID(7)}`,
						value: `${leaderboardArray[7].balance} ${rules.currencyPlural}`
					},
					{
						name: `#9 ${await userTagFromID(8)}`,
						value: `${leaderboardArray[8].balance} ${rules.currencyPlural}`
					},
					{
						name: `#10 ${await userTagFromID(9)}`,
						value: `${leaderboardArray[9].balance} ${rules.currencyPlural}`
					}
				]
			}
		});
	}
};
