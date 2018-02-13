// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const diceAPI = require('../../providers/diceAPI');
const rules = require('../../rules');

module.exports = class StatisticsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'statistics',
			group: 'util',
			memberName: 'statistics',
			description: `Get statistics on <@${rules.houseID}>`,
			aliases: ['stats'],
			examples: ['statistics'],
			throttling: {
				usages: 2,
				duration: 20
			}
		});
	}

	async run(msg) {
		try {
			msg.channel.startTyping();

			const serverCount = await this.client.shard.broadcastEval('this.guilds.size');

			return msg.replyEmbed({
				title: 'Dice Statistics',
				fields: [
					{
						name: '👤 Total Number of Users',
						// Subtract one because of the Dice bot and lottery jackpot
						value: `${(await diceAPI.totalUsers()) - 2} users`
					},
					{
						name: '👥 Total Number of Servers',
						value: `${serverCount.reduce((prev, val) => prev + val, 0)} servers`
					}
				]
			});
		} finally {
			msg.channel.stopTyping();
		}

	}
};
