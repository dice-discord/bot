// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise');
const winston = require('winston');

module.exports = class XKCDCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'xkcd',
			group: 'fun',
			memberName: 'xkcd',
			description: 'Get an XKCD comic',
			details: 'Not specifying the comic to lookup will give you the most recent comic',
			aliases: ['random-xkcd', 'xkcd-comic', 'random-xkcd-comic'],
			examples: ['xkcd', 'xkcd 314'],
			args: [{
				key: 'comic',
				prompt: 'What comic number do you want see?',
				type: 'integer',
				default: 'latest'
			}],
			throttling: {
				usages: 2,
				duration: 6
			}
		});
	}

	async run(msg, { comic }) {
		try {
			msg.channel.startTyping();

			let options = {
				uri: `https://xkcd.com/${comic}/info.0.json`,
				json: true
			};
			if (comic === 'latest') {
				options.uri = `https://xkcd.com/info.0.json`
			}

			const result = await rp(options).catch(error => {
				winston.error('[COMMAND](XKCD)', error.stack);
				return msg.reply('❌ There was an error with the XKCD website');
			});

			return msg.replyEmbed({
				title: `${result.safe_title} (${result.num})`,
				author: {
					name: 'XKCD',
					iconURL: 'https://i.imgur.com/AP0vVy5.png',
					url: 'https://xkcd.com'
				},
				image: { url: result.img },
				fields: [{
					name: 'Alt',
					value: result.alt
				}]
			});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
