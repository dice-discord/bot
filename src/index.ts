declare global {
	namespace NodeJS {
		interface Global {
			__rootdir__: string;
		}
	}
}

global.__rootdir__ = __dirname || process.cwd();

import {ShardingManager} from 'kurasuta';
import {join} from 'path';
import {discordToken, runningInProduction} from './config';
import {DiceClient} from './structures/DiceClient';
import {baseLogger} from './util/logger';
import {registerSharderEvents} from './util/register-sharder-events';

const sharder = new ShardingManager(join(__dirname, 'structures', 'DiceCluster'), {
	client: DiceClient,
	development: !runningInProduction,
	// Only restart in production
	respawn: runningInProduction,
	retry: runningInProduction,
	// Used to automatically determine recommended shard count from the Discord API
	token: discordToken
});

const logger = baseLogger.scope('sharder');

registerSharderEvents(sharder, logger);

sharder.spawn().catch(logger.fatal);
