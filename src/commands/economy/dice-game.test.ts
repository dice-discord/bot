import {winPercentage} from './dice-game';

test('winPercentage', () => {
	expect(winPercentage(2)).toBe(0.495);
	expect(winPercentage(100)).toBe(0.0099);
});
