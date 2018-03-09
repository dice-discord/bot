// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const rp = require('request-promise');
const winston = require('winston');
const moment = require('moment');

module.exports = class XKCDCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'xkcd',
			group: 'fun',
			memberName: 'xkcd',
			description: 'Get an XKCD comic',
			details: 'Not specifying the comic to lookup will give you the most recent comic',
			aliases: ['random-xkcd', 'xkcd-comic', 'random-xkcd-comic'],
			examples: ['xkcd', 'xkcd 614'],
			args: [{
				key: 'comic',
				prompt: 'What comic number do you want see?',
				type: 'integer',
				default: 'latest',
				min: 1
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

			const options = {
				uri: `https://xkcd.com/${comic}/info.0.json`,
				json: true
			};
			if (comic === 'latest') {
				options.uri = 'https://xkcd.com/info.0.json';
			}

			const result = await rp(options).catch(error => {
				winston.error('[COMMAND](XKCD)', error.stack);
				return msg.reply('❌ There was an error with the XKCD website');
			});

			// Result embed
			const embed = new MessageEmbed({
				title: `${result.safe_title} (#${result.num})`,
				author: {
					name: 'XKCD',
					iconURL: 'https://i.imgur.com/AP0vVy5.png',
					url: 'https://xkcd.com'
				}
			});

			// Check if comic exists
			if (result.img) {
				embed.setImage(result.img);
			} else {
				return msg.reply('❌ Couldn\'t find that comic');
			}

			const truncateText = (string) => {
				if (string.length > 1024) {
					return `${string.substring(0, 1024 - 3)}...`;
				} else {
					return string;
				}
			};

			// Alt text
			if (result.alt) {
				embed.addField('Alt', truncateText(result.alt));
			}

			// Transcript
			if (result.alt) {
				embed.addField('Transcript', truncateText(result.transcript));
			}

			// Check if there's a link
			if (result.link) {
				embed.setURL(result.link);
			} else {
				embed.setURL(result.img);
			}

			// Creation date
			if (result.day && result.month && result.year) {
				embed.setTimestamp(new Date(moment([result.year, result.month, result.day])));
			}

			return msg.replyEmbed(embed);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
