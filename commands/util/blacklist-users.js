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

const logger = require('../../providers/logger').scope('command', 'blacklist users');
const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class BlacklistUsersCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist-users',
      aliases: ['blacklist', 'blacklist-user'],
      group: 'util',
      memberName: 'blacklist-users',
      description: 'Prohibit a user from using the bot.',
      throttling: {
        usages: 2,
        duration: 3
      },
      ownerOnly: true,
      args: [{
        key: 'users',
        label: 'user',
        prompt: 'What users do you want to blacklist?',
        type: 'user',
        default: [],
        infinite: true
      }]
    });
  }

  async run(msg, { users }) {
    const blacklist = await this.client.provider.get('global', 'blacklist', []);
    // eslint-disable-next-line max-len
    logger.debug('Blacklist from provider (will be empty if result is empty array):', blacklist);

    if (users.length > 0) {
      let error = '';
      users.forEach(user => {
        if (this.client.isOwner(user.id)) {
          msg.reply(`All blacklisted users:\n${blacklist.join('\n')}`, { split: true });
        } else if (blacklist.includes(user.id)) {
          error += `${user} is already blacklisted.\n`;
        } else {
          blacklist.push(user.id);
        }
      });

      if (error) return msg.reply(`${error}No users were blacklisted.`, { split: true });

      await this.client.provider.set('global', 'blacklist', blacklist);

      // Respond to author with success
      respond(msg);

      return null;
    } else if (blacklist.length > 0) {
      logger.debug('Blacklisted users:', blacklist);
      return msg.reply(`All blacklisted users:\n${blacklist.join('\n')}`, { split: true });
    }
    return msg.reply('No blacklisted users.');
  }
};
