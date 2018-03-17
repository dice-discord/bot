// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');
const winston = require('winston');

module.exports = class DateFactsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'date-facts',
			group: 'fun',
			memberName: 'date-facts',
			description: 'Get a fact about a date',
			details: 'Not specifying the date to lookup will give you a random fact',
			aliases: ['date-fact', 'random-date-facts', 'random-date-fact'],
			examples: ['date-facts', 'date-facts 46'],
			args: [{
				key: 'month',
				prompt: 'What month do you want to get facts for?',
				type: 'integer',
				max: 12,
				min: 1,
				default: 'random'
			}, {
				key: 'day',
				prompt: 'What day of the month do you want to get facts for?',
				type: 'integer',
				max: 31,
				min: 1,
				default: 'random'
			}],
			throttling: {
				usages: 2,
				duration: 6
			}
		});
	}

	async run(msg, { month, day }) {
		try {
			msg.channel.startTyping();

			const options = { uri: `http://numbersapi.com/${month}/${day}/date` };

			// At least one of the values was left undefined
			if(month === 'random' || day === 'random') {
				options.uri = 'http://numbersapi.com/random/date';
			}

			const result = await rp(options).catch(error => {
				winston.error('[COMMAND](DATE-FACTS)', error.stack);
				return msg.reply('❌ There was an error with the API we use (http://numbersapi.com)');
			});

			return msg.reply(result);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
