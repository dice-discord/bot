const { Command } = require('discord.js-commando');

module.exports = class FaceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'face',
			group: 'minecraft',
			memberName: 'face',
			description: 'Shows an isometric view of a Minecraft user\'s face',
			aliases: ['minecraft-face', 'mc-face'],
			examples: ['face Notch'],
			throttling: {
				usages: 1,
				duration: 15
			},
			args: [{
				key: 'username',
				prompt: 'What user do you want to look up?',
				type: 'string'
			}]
		});
	}

	run(msg, { username }) {
		return msg.reply({
			embed: {
				author: {
					name: username,
					icon_url: `https://minotar.net/helm/${username}`
				},
				image: { url: `https://minotar.net/cube/${username}` }
			}
		});
	}
};
