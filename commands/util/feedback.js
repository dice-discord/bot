// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class FeedbackCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'feedback',
			aliases: ['bug-report', 'feed-back', 'suggest', 'suggestion'],
			group: 'util',
			memberName: 'feedback',
			description: 'Submit bugs and suggestions to the developer',
			examples: ['feedback When I use `$dice` the bot lags.'],
			args: [
				{
					key: 'userFeedback',
					prompt: 'What is your feedback you want to report?',
					type: 'string'
				}
			],
			throttling: {
				usages: 2,
				duration: 60
			}
		});
	}

	run(msg, { userFeedback }) {
		const message = '📝 Thanks for sending your feedback.';
		if (
			userFeedback.toLowerCase().includes('help') ||
			userFeedback.toLowerCase().includes('support')
		) {
			msg.reply(`${message} If you need help with a problem use the \`support\` command.`);
		} else {
			msg.reply(message);
		}

		winston.debug('[COMMAND](FEEDBACK) About to send RichEmbed');

		// Pizza Fox#0075
		const developer = this.client.users.resolve('210024244766179329');

		return developer.send({
			embed: {
				author: {
					name: msg.author.tag,
					icon_url: msg.author.displayAvatarURL(128)
				},
				timestamp: new Date(msg.createdTimestamp),
				fields: [
					{
						name: 'Message',
						value: userFeedback
					}
				]
			}
		});
	}
};
