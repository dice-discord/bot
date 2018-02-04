const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const diceAPI = require('../../diceAPI');
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
				duration: 30,
			},
			ownerOnly: true,
		});
	}

	async run(msg) {
		const database = await diceAPI.allUsers();
		const botClient = this.client;
		const userList = [];

		const userTagFromID = async arrayPlace => {
			winston.debug(`[COMMAND](USER-LIST) Checking user tag from array index ${arrayPlace}`);
			return botClient.users.fetch(database[arrayPlace].id).tag;
		};

		for (let index = 0; index < database.length; index++) {
			userList.push(`${await userTagFromID(index)} (\`${database[index].id}\`)`);
		}

		winston.debug(`[COMMAND](USER-LIST) First item in userList: ${userList[0]}`);

		// prettier-ignore
		return msg.reply(`👤 ${userList.join('\n')}\n
		${await diceAPI.totalUsers()} users in total. ${userList.length} users were listed.`, { split: true });
	}
};
