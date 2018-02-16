// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class GetHackBansCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'get-hack-bans',
			aliases: ['get-hack-ban'],
			group: 'mod',
			memberName: 'get-hack-bans',
			description: 'Check the hackbans on a server',
			examples: ['get-hack-bans'],
			guildOnly: true,
			userPermissions: ['MANAGE_GUILD'],
			throttling: {
				usages: 2,
				duration: 4
			}
		});
	}

	async run(msg) {
		try {
			msg.channel.startTyping();

			const bans = await this.client.provider.get(msg.guild, 'bans');
			let message;

			if (bans) {
				// Member can be banned
				for (const profile in bans) {
					message.push(`${profile.tag} (\`${profile.id}\`) for ${profile.reason}`);
				}

				return msg.reply(message, { split: true });
			} else {
				return msg.reply('❌ No hackbans found on this server.');
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
