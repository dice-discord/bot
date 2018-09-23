// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class ShardCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shard',
      group: 'dev',
      memberName: 'shard',
      description: 'Get info about this shard.',
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg) {
    return msg.reply(`Shard ${this.client.shard.id}`);
  }
};
