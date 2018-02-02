const { Command } = require('discord.js-commando');
const { Util } = require('discord.js');
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
			examples: ['server-list'],
			throttling: {
				usages: 2,
				duration: 30,
			},
			ownerOnly: true,
		});
	}

	run(msg) {
		let guilds = this.client;
		guilds = this.client.guilds;
		const guildList = [];

		// For each guild the bot is in, add it to the list
		for (const guild of guilds.values(); let index = 0; index < 40; index++) {
			guildList.push(`${guild.name} (\`${guild.id}\`)`);
		}
		
		// One giant message
		singleMessage = guildList.join('\n')
		// Multiple messages to avoid the max character limit
		multipleMessages = Util.splitMessage(singleMessage);
		
		// For each item in the multiple messages array, send on of the messages
		for (let index = 0; index < multipleMessages.length; index++) {
			msg.say(multipleMessage[index]);
		}

		return msg.reply(`👥 Finished! ${guilds.size} servers in total. ${multipleMessages.length} of them were listed.`);
	}
};
