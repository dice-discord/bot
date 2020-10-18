import * as signale from 'signale';
import {secrets} from '../config';

const options: signale.SignaleOptions<'command'> | undefined = {
	secrets,
	config: {displayDate: true, displayTimestamp: true},
	types: {
		command: {
			badge: '💬',
			color: 'gray',
			label: 'command',
			logLevel: 'debug'
		}
	}
};

const logger: signale.Signale<signale.DefaultMethods | 'command'> = new signale.Signale(options);

export const baseLogger = logger;
