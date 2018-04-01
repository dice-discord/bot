// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');

module.exports = class QuoteMessageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'quote-message',
			aliases: ['quote'],
			group: 'util',
			memberName: 'quote-message',
			description: 'Quote a message from a server.',
			examples: ['quote-message 424936127154094080'],
			guildOnly: true,
			args: [{
				key: 'message',
				prompt: 'What message do you want to quote?',
				type: 'message',
				label: 'message ID'
			}],
			clientPermissions: ['EMBED_LINKS'],
			throttling: {
				usages: 2,
				duration: 6
			}
		});
	}

	run(msg, { message }) {
		const truncateText = string => {
			if(string.length > 1024) {
				return `${string.substring(0, 1024 - 3)}...`;
			} else {
				return string;
			}
		};

		const embed = new MessageEmbed({
			author: {
				name: message.author.tag,
				iconURL: message.author.displayAvatarURL(128)
			}
		});

		// Check if message had content
		winston.debug('[COMMAND](QUOTE-MESSAGE) Does the message have content:', !!message.content);
		if(message.content) embed.setDescription(truncateText(message.content));

		// Check every attachment for one that's an image
		for(const attachment of message.attachments.values()) {
			if(attachment.width && attachment.length) {
				embed.setImage(attachment.url);
				winston.debug('[COMMAND](QUOTE-MESSAGE) Found an image:', attachment.url);
				break;
			}
		}

		return msg.replyEmbed(embed);
	}
};
