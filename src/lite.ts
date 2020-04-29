import {DiceClient} from './structures/DiceClient';
import {discordToken} from './config';
import {baseLogger} from './util/logger';

const logger = baseLogger.scope('lite');

const client = new DiceClient();

client.init().catch(error => logger.fatal('Failed to initialize client', error));
client.login(discordToken).catch(error => logger.fatal('Failed to login client', error));
