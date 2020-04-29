import {Signale} from 'signale';
import {secrets} from '../config';
import * as signale from 'signale';

const options = {
	secrets,
	types: {
		command: {
			badge: '💬',
			color: 'gray',
			label: 'command',
			logLevel: 'debug'
		}
	}
};

const logger: signale.Signale<signale.DefaultMethods | 'command'> = new Signale(options);

export const baseLogger = logger;
