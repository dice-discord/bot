// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const rules = require('../../rules');

module.exports = class SupportCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'support',
			group: 'util',
			memberName: 'support',
			description: `An invite to the <@${rules.houseID}> server`,
			aliases: ['home', 'report', 'bug'],
			examples: ['support']
		});
	}

	run(msg) {
		msg.reply('👋 Please talk to <@210024244766179329> on https://discord.gg/NpUmRkj');
	}
};
