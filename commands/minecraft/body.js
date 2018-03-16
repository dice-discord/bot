const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');

module.exports = class BodyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'body',
			group: 'minecraft',
			memberName: 'body',
			description: 'Shows an isometric view of a Minecraft user\'s body',
			aliases: ['minecraft-body', 'mc-body'],
			examples: ['body 853c80ef3c3749fdaa49938b674adae6', 'body 0729c688b2ae4b32aa0b15433cb41ca2 false'],
			throttling: {
				usages: 1,
				duration: 3
			},
			args: [{
				key: 'uuid',
				prompt: 'What is user ID of the user do you want to look up?',
				type: 'string'
			}, {
				key: 'isometric',
				prompt: 'Should the view be from an angle?',
				type: 'boolean',
				default: true
			}]
		});
	}

	async run(msg, { uuid, isometric }) {
		const embed = new MessageEmbed({
			author: {
				name: username
			}
		});
		if (isometric) {
			embed.setImage(`http://crafatar.com/renders/body/${username}?scale=10`);
		} else {
			embed.setImage(`https://minotar.net/body/${username}`);
		}

		winston.debug(`[COMMAND](BODY) URL for ${username}: ${embed.image.url}`);
		return msg.reply(embed);
	}
};
