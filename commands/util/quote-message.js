// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const path = require('path');
const winston = require('winston');

module.exports = class QuoteMessageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'quote-message',
			aliases: ['quote'],
			group: 'util',
			memberName: 'quote-message',
			description: 'Quote a message from a text channel.',
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
			timestamp: message.createdAt,
			author: {
				name: message.author.tag,
				iconURL: message.author.displayAvatarURL(128)
			},
			fields: [{
				name: 'Channel',
				value: message.channel.toString()
			}]
		});

		// Check if message had content
		winston.debug('[COMMAND](QUOTE-MESSAGE) Does the message have content:', !!message.content);
		if(message.content) embed.setDescription(truncateText(message.content));


		// The image from the message
		let messageImage;
		// Valid image file extensions
		const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
		// RegEx for a URL to an image
		const linkRegex = /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/[\w-_.]+)+\.(?:png|jpg|jpeg|gif|webp)/;

		// Embed (that may or may not exist) with an image in it
		const imageEmbed = message.embeds.find(msgEmbed => msgEmbed.type === 'rich' &&
			msgEmbed.image &&
				extensions.includes(path.extname(msgEmbed.image.url)));
		if(imageEmbed) messageImage = imageEmbed.image.url;

		// Uploaded image
		const attachment = message.attachments.find(file => extensions.includes(path.extname(file.url)));
		if(attachment) {
			messageImage = attachment.url;
		}

		// If there wasn't an uploaded image check if there was a URL to one
		if(!messageImage) {
			const linkMatch = message.content.match(linkRegex);
			if(linkMatch && extensions.includes(path.extname(linkMatch[0]))) {
				messageImage = linkMatch[0];
			}
		}

		// If there was an image, set the embed's image to it
		if(messageImage) embed.setImage(messageImage);

		return msg.replyEmbed(embed);
	}
};
