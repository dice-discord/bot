// Sqreen must be imported first
// eslint-disable-next-line import/no-unassigned-import
import 'sqreen';

import {start as startProfiler} from '@google-cloud/profiler';
import {start as startDebugAgent} from '@google-cloud/debug-agent';
import {captureException} from '@sentry/node';
import {Util} from 'discord.js';
import {ShardingManager} from 'kurasuta';
import {join} from 'path';
import {discordToken, googleAppCredentials, googleBaseConfig, runningInProduction} from './config';
import {DiceClient} from './structures/DiceClient';
import {baseLogger} from './util/logger';
import {registerSharderEvents} from './util/register-sharder-events';

const logger = baseLogger.scope('sharder');

if (googleAppCredentials) {
	const googleConfig = Util.mergeDefault(googleBaseConfig, {serviceContext: {service: 'sharder'}});

	try {
		startDebugAgent(googleConfig);
		logger.success('Started Google Cloud Debug Agent');
	} catch (error) {
		logger.error('Failed to initialize Google Cloud Debug Agent', error);
		captureException(error);
	}
}

const sharder = new ShardingManager(join(__dirname, 'structures', 'DiceCluster'), {
	client: DiceClient,
	development: !runningInProduction,
	// Only restart in production
	respawn: runningInProduction,
	retry: runningInProduction,
	// Used to automatically determine recommended shard count from the Discord API
	token: discordToken
});

registerSharderEvents(sharder, logger);

sharder.spawn().catch(error => {
	logger.fatal(error);
	throw error;
});
