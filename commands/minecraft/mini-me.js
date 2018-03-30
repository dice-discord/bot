const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');

module.exports = class MiniMeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mini-me',
			group: 'minecraft',
			memberName: 'mini-me',
			// eslint-disable-next-line max-len
			description: 'Shows a \'mini-me\' of a Minecraft user\'s body with an option for a transparent background or gradient.',
			aliases: ['minecraft-mini-me', 'mc-mini-me', 'minecraft-mini', 'mc-mini', 'mini'],
			examples: ['mini-me Notch', 'mini-me Notch false'],
			throttling: {
				usages: 1,
				duration: 3
			},
			args: [{
				key: 'username',
				prompt: 'What user do you want to look up?',
				type: 'string'
			}, {
				key: 'transparency',
				prompt: 'Should the background be transparent?',
				type: 'boolean',
				default: true
			}]
		});
	}

	run(msg, { username, transparency }) {
		winston.debug(`Transparency value: ${transparency}`);

		const embed = new MessageEmbed({
			author: {
				name: username,
				// eslint-disable-next-line camelcase
				icon_url: `https://minotar.net/helm/${encodeURIComponent(username)}`
			}
		});

		if(transparency) {
			// eslint-disable-next-line max-len
			embed.setImage(`http://avatar.yourminecraftservers.com/avatar/trnsp/steve/tall/128/${encodeURIComponent(username)}.png`);
		} else {
			// eslint-disable-next-line max-len
			embed.setImage(`http://avatar.yourminecraftservers.com/avatar/rad/steve/tall/128/${encodeURIComponent(username)}.png`);
		}
		winston.debug(`Image URL for ${username}: ${embed.image.url}`);
		return msg.reply(embed);
	}
};
