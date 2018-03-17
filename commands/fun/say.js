// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'say',
			group: 'fun',
			memberName: 'say',
			description: 'Have the bot say a phrase you specify',
			details: 'Only the bot owner(s) may use this command',
			aliases: ['repeat'],
			examples: ['say I am a bot'],
			ownerOnly: true,
			args: [{
				key: 'phrase',
				prompt: 'What do you want to have said?',
				type: 'string'
			}],
			throttling: {
				usages: 2,
				duration: 6
			}
		});
	}

	run(msg, { phrase }) {
		if(msg.deletable) msg.delete();
		return msg.say(phrase);
	}
};
