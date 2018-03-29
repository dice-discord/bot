// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise-native');
const winston = require('winston');

module.exports = class NumberFactsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'number-facts',
			group: 'fun',
			memberName: 'number-facts',
			description: 'Get a fact about a number',
			details: 'Not specifying the number to lookup will give you a random fact',
			aliases: ['num-facts',
				'number-fact',
				'random-number-facts',
				'random-num-facts',
				'num-fact',
				'random-number-fact',
				'random-num-fact'
			],
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

	run(msg, { number }) {
		try {
			msg.channel.startTyping();

			const options = { uri: `http://numbersapi.com/${number}` };
			rp(options)
				.then(result => msg.reply(result))
				.catch(error => {
					winston.error('[COMMAND](DATE-FACTS)', error.stack);
					return msg.reply('❌ There was an error with the API we use (http://numbersapi.com)');
				});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
