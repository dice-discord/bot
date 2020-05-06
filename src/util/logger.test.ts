import {baseLogger} from './logger';

test('baseLogger', () => {
	expect(baseLogger).toHaveProperty('command' as keyof typeof baseLogger);
});
