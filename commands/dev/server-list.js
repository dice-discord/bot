// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rules = require('../../rules');

module.exports = class ServerListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'server-list',
			group: 'dev',
			memberName: 'server-list',
			description: `List all servers <@${rules.houseID}> is on`,
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['list-servers', 'guild-list', 'list-guilds'],
			throttling: {
				usages: 2,
				duration: 30
			},
			ownerOnly: true
		});
	}

	run(msg) {
		const guilds = this.client.guilds;
		const guildList = [];

		// For each guild the bot is in, add it to the list
		for(const guild of guilds.values()) {
			guildList.push(`${guild.name} (\`${guild.id}\`)`);
		}

		return msg.reply(`${guildList.join('\n')}\n
		👥 ${guilds.size} servers in total. ${guildList.length} servers were listed.`, { split: true });
	}
};
