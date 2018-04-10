const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');

module.exports = class BodyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'body',
			group: 'minecraft',
			memberName: 'body',
			description: 'Shows a Minecraft user\'s body.',
			aliases: ['minecraft-body', 'mc-body'],
			examples: ['body Notch'],
			clientPermissions: ['EMBED_LINKS'],
			throttling: {
				usages: 1,
				duration: 3
			},
			args: [{
				key: 'user',
				prompt: 'What is username you want to look up?',
				type: 'string',
				label: 'username'
			}]
		});
	}

	run(msg, { user }) {
		const embed = new MessageEmbed({
			author: { name: user },
			image: { url: `https://minotar.net/body/${encodeURIComponent(user)}` }
		});

		winston.debug(`[COMMAND](BODY) URL for ${user}: ${embed.image.url}`);
		return msg.reply(embed);
	}
};
