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
const database = require('../../util/database');

module.exports = class DatabasePingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'database-ping',
      group: 'dev',
      memberName: 'database-ping',
      description: 'Checks the bot\'s ping to the Discord server and does a database request.',
      aliases: ['db-ping'],
      throttling: {
        usages: 2,
        duration: 20
      }
    });
  }

  async run(msg) {
    try {
      msg.channel.startTyping();
      if (!msg.editable) {
        await database.balances.get(msg.author.id);
        const pingMsg = await msg.reply('Pinging...');
        // eslint-disable-next-line max-len
        return pingMsg.edit(`${msg.channel.type !== 'dm' ? `${msg.author},` : ''} Pong! The message round-trip took ${pingMsg.createdTimestamp - msg.createdTimestamp}ms. ${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}`);
      }
      await database.balances.get(msg.author.id);
      await msg.edit('Pinging...');
      // eslint-disable-next-line max-len
      return msg.edit(`Pong! The message round-trip took ${msg.editedTimestamp - msg.createdTimestamp}ms. ${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}`);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
