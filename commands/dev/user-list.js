// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const diceAPI = require('../../providers/diceAPI');
const winston = require('winston');

module.exports = class UserListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'user-list',
			group: 'dev',
			memberName: 'user-list',
			description: `List all users of <@${rules.houseID}>`,
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['list-users'],
			examples: ['user-list'],
			throttling: {
				usages: 2,
				duration: 30
			},
			ownerOnly: true
		});
	}

	async run(msg) {
		try {
			msg.channel.startTyping();
			const database = await diceAPI.allUsers();
			const userList = [];

			msg.reply('About to start fetching users, this could take an extremely long time.');
			for (let index = 0; index < database.length; index++) {
				winston.debug(`[COMMAND](USER-LIST) Checking ID #${index + 1}. ${database[index].id}`);
				userList.push(`${await this.client.users.fetch(database[index].id).tag} (\`${database[index].id}\`)`);
			}

			winston.debug(`[COMMAND](USER-LIST) First item in userList: ${userList[0]}`);

			return msg.reply(`👤 ${userList.join('\n')}\n
			${await diceAPI.totalUsers()} users in total. ${userList.length} users were listed.`, { split: true });
		} finally {
			msg.channel.stopTyping();
		}
	}
};
