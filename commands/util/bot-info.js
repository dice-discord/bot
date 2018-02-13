// Copyright 2018 Jonah Snider

const moment = require('moment');
const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const packageData = require('../../package');

module.exports = class BotInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'bot-info',
			group: 'util',
			memberName: 'bot-info',
			description: `Information about <@${rules.houseID}>`,
			aliases: ['github', 'uptime', 'library', 'git', 'lib'],
			examples: ['bot-info']
		});
	}

	run(msg) {
		return msg.replyEmbed({
			title: 'Dice',
			url: 'https://github.com/PizzaFox/dice',
			color: 0x4caf50,
			description: `${this.client.user} was made by <@210024244766179329> based off the game [bustadice](https://bustadice.com).`,
			thumbnail: {
				url: this.client.user.displayAvatarURL({ format: 'webp' })
			},
			fields: [{
				name: '🕒 Uptime',
				value: moment.duration(this.client.uptime).humanize(),
				inline: true
			}, {
				name: '🎲 Dice Version',
				value: `v${packageData.version}`,
				inline: true
			},
			{
				name: '🔧 GitHub',
				value: `${this.client.user} is open source! [See the repository](https://github.com/PizzaFox/dice)`,
				inline: true
			},
			{
				name: '🔧 Discord.js Version',
				value: '12.0.0-dev',
				inline: true
			},
			{
				name: '🤖 Discord.js Commando Version',
				value: '0.9.0',
				inline: true
			},
			{
				name: '🤠 Support team',
				value: '<@115511836543025152> and <@208970190547976202>'
			}
			]
		});
	}
};
