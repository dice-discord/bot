// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const config = require('../../config');

module.exports = class SupportCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'support',
			group: 'util',
			memberName: 'support',
			description: `An invite to the <@${config.clientID}> server`,
			aliases: ['home', 'report', 'bug'],
			throttling: {
				usages: 1,
				duration: 3
			}
		});
	}

	run(msg) {
		msg.reply('👋 https://discord.gg/NpUmRkj');
	}
};
