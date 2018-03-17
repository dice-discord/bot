// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');
const winston = require('winston');

module.exports = class RandomCatImageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'random-cat-image',
			group: 'fun',
			memberName: 'random-cat-image',
			description: 'Get a picture of a random cat',
			aliases: ['random-cat', 'cat-image', 'cat'],
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
				uri: 'http://random.cat/meow.php',
				json: true
			};
			rp(options)
				.catch(error => {
					winston.error('[COMMAND](RANDOM-CAT-IMAGE)', error.stack);
					return msg.reply('❌ There was an error with the API we use (http://random.cat)');
				})
				.then(result => msg.replyEmbed({
					author: {
						name: 'random.cat',
						iconURL: 'https://i.imgur.com/Ik0Gf0r.png',
						url: 'http://random.cat'
					},
					image: { url: result.file }
				}));
		} finally {
			msg.channel.stopTyping();
		}
	}
};
