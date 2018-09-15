// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const database = require('../../providers/database');

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
