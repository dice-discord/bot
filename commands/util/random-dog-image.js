// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');

module.exports = class RandomCatImageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'random-cat-image',
			group: 'util',
			memberName: 'random-cat-image',
			description: 'Get a picture of a random cat',
			aliases: ['random-cat', 'cat-image', 'cat'],
			examples: ['cat-image', 'random-cat'],
			throttling: {
				usages: 1,
				duration: 5
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
					iconURL: 'https://dog.ceo/img/dog-api-logo.svg',
					url: 'https://dog.ceo/dog-api/'
				},
				image: { url: result.message }
			});
		} finally {
			msg.channel.stopTyping();
		}

	}
};
