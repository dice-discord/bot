import {DiceClient} from './structures/DiceClient';
import {discordToken, runningInCI} from './config';
import {baseLogger} from './util/logger';
import {ExitCodes} from './constants';

const logger = baseLogger.scope('lite');

const client = new DiceClient();

client.init().catch(error => {
	logger.fatal('Failed to initialize client', error);

	if (runningInCI) {
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(ExitCodes.Error);
	}
});
client.login(discordToken).catch(error => {
	logger.fatal('Failed to login client', error);

	if (runningInCI) {
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(ExitCodes.LoginError);
	}
});
