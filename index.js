// Copyright 2018 Jonah Snider

require('dotenv').config();
const logger = require('./util/logger').scope('shard manager');
const { ShardingManager } = require('discord.js');
const packageData = require('./package');
const config = require('./config');
const sentry = require('@sentry/node');
const manager = new ShardingManager('./dice.js', { token: config.discordToken });

if (config.sentryDSN) sentry.init({ dsn: config.sentryDSN });

manager
  .on('shardCreate', shard => logger.start('Launched shard', shard.id))
  .spawn(manager.totalShards, 10000);

logger.note(`Node.js version: ${process.version}`);
logger.note(`Dice version v${packageData.version}`);
