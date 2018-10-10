/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
