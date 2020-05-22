import {loadFilter} from './commandHandler';

test('loadFilter', () => {
	expect(loadFilter('command.test.ts')).toBe(false);
	expect(loadFilter('command.test.js')).toBe(false);
	expect(loadFilter('command.ts')).toBe(true);
	expect(loadFilter('command.js')).toBe(true);
});
