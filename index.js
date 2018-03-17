// Copyright 2018 Jonah Snider

const winston = require('winston');
winston.level = 'debug';
const { ShardingManager } = require('discord.js');
const packageData = require('./package');
const config = require('./config');

const manager = new ShardingManager('./dice.js', { token: config.botToken });

manager.spawn();
manager
	.on('launch', shard => winston.verbose(`[DICE](SHARDER) Launched shard ${shard.id}`))
	.on('message', (shard, message) => {
		winston.debug(`[SHARD](${shard.id}) : ${message._eval} : ${message._result}`);
	});
winston.verbose(`[DICE] Node.js version: ${process.version}`);
winston.verbose(`[DICE] Dice version v${packageData.version}`);
