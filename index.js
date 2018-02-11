// Copyright Jonah Snider 2018

const winston = require('winston');
const { ShardingManager } = require('discord.js');
const packageData = require('./package');

const manager = new ShardingManager('./dice.js', { token: process.env.BOT_TOKEN });

manager.spawn();
manager
	.on('launch', shard => winston.verbose(`[DICE](SHARDER) Launched shard ${shard.id}`))
	.on('message', (shard, message) => {
		winston.debug(`[SHARD](${shard.id}) : ${message._eval} : ${message._result}`);
	});
winston.verbose(`[DICE] Node.js version: ${process.version}`);
winston.verbose(`[DICE] Dice version v${packageData.version}`);
