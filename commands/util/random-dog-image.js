// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');

module.exports = class RandomDogImageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'random-dog-image',
			group: 'util',
			memberName: 'random-dog-image',
			description: 'Get a picture of a random dog',
			aliases: ['random-dog', 'dog-image', 'dog'],
			throttling: {
				usages: 1,
				duration: 4
			}
		});
	}

	async run(msg) {
		try {
			msg.channel.startTyping();

			const options = {
				uri: 'https://dog.ceo/api/breeds/image/random',
				json: true
			};
			const result = await rp(options);

			if (!result) {
				return msg.reply('❌ There was an error with the API we use (https://dog.ceo/dog-api).');
			} else if (result.status !== 'success') {
				return msg.reply(`❌ There was an error with the API we use (https://dog.ceo/dog-api). Message from them: \`\`\`${result.message}\`\`\``);
			}

			return msg.replyEmbed({
				author: {
					name: 'dog.ceo',
					iconURL: 'https://dog.ceo/img/favicon.png',
					url: 'https://dog.ceo/dog-api/'
				},
				image: { url: result.message }
			});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
