// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const winston = require('winston');

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

			const bans = await this.client.provider.get(msg.guild, 'bans', {});
			const keys = Object.keys(bans);
			winston.debug(`[COMMAND](GET-HACK-BANS) Keys of bans on ${msg.guild.name}`, keys);

			if (bans && bans !== {}) {
				// If there is ban data and it isn't an empty object
				return msg.reply(Object.values(bans).map(ban => `${ban.tag} (\`${ban.id}\`) for \`${ban.reason}\``), { split: true });
			} else {
				return msg.reply('❌ No hackbans found on this server.');
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
