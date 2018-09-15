// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const database = require('../../providers/database');
const config = require('../../config');

module.exports = class StatisticsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'statistics',
      group: 'util',
      memberName: 'statistics',
      description: `Get statistics on <@${config.clientID}>.`,
      aliases: ['stats'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 2,
        duration: 20
      }
    });
  }

  async run(msg) {
    try {
      msg.channel.startTyping();

      const serverCount = await this.client.shard.broadcastEval('this.guilds.size');

      return msg.replyEmbed({
        title: 'Dice Statistics',
        fields: [
          {
            name: '👤 Total Number of Users',
            // Subtract one because of the Dice bot and for the Dice Dev bot
            value: `${(await database.totalUsers() - 2).toLocaleString()} users`
          },
          {
            name: '👥 Total Number of Servers',
            value: `${serverCount.reduce((prev, val) => prev + val, 0).toLocaleString()} servers`
          }
        ]
      });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
