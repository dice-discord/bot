// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');

module.exports = class NumberFactsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'number-facts',
			group: 'fun',
			memberName: 'number-facts',
			description: 'Get a fact about a number',
			details: 'Not specifying the number to lookup will give you a random fact',
			aliases: ['num-facts', 'number-fact', 'random-number-facts', 'random-num-facts', 'num-fact', 'random-number-fact', 'random-num-fact'],
			examples: ['number-facts', 'number-facts 46'],
			args: [{
				key: 'number',
				prompt: 'What number do you want to get facts for?',
				type: 'integer',
				default: 'random'
			}],
			throttling: {
				usages: 2,
				duration: 6
			}
		});
	}

	async run(msg, { number }) {
		try {
			msg.channel.startTyping();

			const options = {
				uri: `http://numbersapi.com/${number}`
			};
			const result = await rp(options);

			return msg.reply(result);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
