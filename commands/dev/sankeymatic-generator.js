// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class SankeyMATICGeneratorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sankeymatic-generator',
      group: 'dev',
      memberName: 'sankeymatic-generator',
      description: 'Creates code for a SankeyMATIC diagram display server counts for each shard.',
      details: 'Only the bot owner(s) may use this command.',
      aliases: [
        'sankeymatic',
        'sankey',
        'flow-chart'
      ],
      throttling: {
        usages: 2,
        duration: 15
      },
      ownerOnly: true
    });
  }

  async run(msg) {
    const serverCounts = await this.client.shard.fetchClientValues('guilds.size');
    let result = '';

    serverCounts.forEach(shardServerCount => {
      result += `Shard ${serverCounts.indexOf(shardServerCount)} [${shardServerCount}] Server Count\n`;
    });

    return msg.say(result, { split: true });
  }
};
