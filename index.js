// Copyright 2018 Jonah Snider

const logger = require('./providers/logger').scope('shard manager');
const { ShardingManager } = require('discord.js');
const packageData = require('./package');
const config = require('./config');
const manager = new ShardingManager('./dice.js', { token: config.discordToken });

manager
  .on('shardCreate', shard => logger.start('Launched shard', shard.id))
  .spawn(this.totalShards, 10000);

logger.note(`Node.js version: ${process.version}`);
logger.note(`Dice version v${packageData.version}`);
