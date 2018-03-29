// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise-native');
const winston = require('winston');

module.exports = class RandomDogImageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'random-dog-image',
			group: 'fun',
			memberName: 'random-dog-image',
			description: 'Get a picture of a random dog',
			aliases: ['random-dog', 'dog-image', 'dog'],
			throttling: {
				usages: 1,
				duration: 4
			}
		});
	}

	run(msg) {
		try {
			msg.channel.startTyping();

			const options = {
				uri: 'https://dog.ceo/api/breeds/image/random',
				json: true
			};
			rp(options)
				.catch(error => {
					winston.error('[COMMAND](RANDOM-CAT-IMAGE)', error.stack);
					return msg.reply('❌ There was an error with the API we use (http://dog.ceo/dog-api)');
				})
				.then(result => msg.replyEmbed({
					author: {
						name: 'dog.ceo',
						iconURL: 'https://dog.ceo/img/favicon.png',
						url: 'https://dog.ceo/dog-api/'
					},
					image: { url: result.message }
				}));
		} finally {
			msg.channel.stopTyping();
		}
	}
};
