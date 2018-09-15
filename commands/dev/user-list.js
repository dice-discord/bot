// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const config = require('../../config');
const database = require('../../providers/database');
const logger = require('../../providers/logger').scope('command', 'user list');

module.exports = class UserListCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'user-list',
      group: 'dev',
      memberName: 'user-list',
      description: `List all users of <@${config.clientID}>.`,
      details: 'Only the bot owner(s) may use this command.',
      aliases: ['list-users'],
      throttling: {
        usages: 2,
        duration: 40
      },
      ownerOnly: true
    });
  }

  async run(msg) {
    try {
      msg.channel.startTyping();

      const allUsers = await database.allUsers();
      const userList = [];

      msg.reply('About to start fetching users, this could take an extremely long time.');
      for (let index = 0; index < allUsers.length; index++) {
        logger.debug(`Checking ID #${index + 1}. ${allUsers[index].id}`);
        userList.push(`${await this.client.users.fetch(allUsers[index].id).tag} (\`${allUsers[index].id}\`)`);
      }

      logger.debug(`First item in userList: ${userList[0]}`);

      return msg.reply(`👤 ${userList.join('\n')}\n
			${await allUsers.totalUsers()} users in total. ${userList.length} users were listed.`, { split: true });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
