const {
	Command
} = require('discord.js-commando');
const diceAPI = require('../../diceAPI');

// Copyright Jonah Snider 2018

module.exports = class DatabasePingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'database-ping',
			group: 'dev',
			memberName: 'database-ping',
			description: 'Checks the bot\'s ping to the Discord server and does a database request.',
			aliases: ['db-ping'],
			examples: ['database-ping'],
			throttling: {
				usages: 2,
				duration: 20
			}
		});
	}

	async run(msg) {
		if (!msg.editable) {
			await diceAPI.getBalance(msg.author.id);
			const pingMsg = await msg.reply('Pinging...');
			return pingMsg.edit(`
				${msg.channel.type !== 'dm' ? `${msg.author},` : ''} Pong! The message round-trip took ${pingMsg.createdTimestamp - msg.createdTimestamp}ms. ${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		} else {
			await diceAPI.getBalance(msg.author.id);
			await msg.edit('Pinging...');
			return msg.edit(
				`Pong! The message round-trip took ${msg.editedTimestamp - msg.createdTimestamp}ms. ${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		}
	}
};
