import {simpleFormat, capitalizeFirstCharacter, truncateText, maxColumnLength, formatTable} from './format';

test('simpleFormat', () => {
	expect(simpleFormat(1.2345)).toBe(1.23);
	expect(simpleFormat(1)).toBe(1);
	expect(simpleFormat(0)).toBe(0);
	expect(simpleFormat(-1)).toBe(-1);
	expect(simpleFormat(-1.2345)).toBe(-1.23);
});

test('capitalizeFirstCharacter', () => {
	expect(capitalizeFirstCharacter('hello')).toBe('Hello');
	expect(capitalizeFirstCharacter('Hello')).toBe('Hello');
	expect(capitalizeFirstCharacter('12345')).toBe('12345');
});

test('truncateText', () => {
	expect(truncateText('12345', 3)).toBe('12…');
	expect(truncateText('12345', 6)).toBe('12345');
	expect(truncateText('a'.repeat(2048 + 1))).toBe(`${'a'.repeat(2048 - 1)}…`);
});

test('maxColumnLengths', () => {
	expect(
		maxColumnLength([
			['123', '12', '1'],
			['12345', '12', '1234']
		])
	).toStrictEqual([5, 2, 4]);
});

test('formatTable', () => {
	// Keep the special spacing for better readability
	// prettier-ignore
	const table = [
		['Product', 'Quantity', 'Cost'],
		['---'    , '---'     , '---' ],
		['Dice'   , '1'       , '$100']
	]
	expect(formatTable(table, '|')).toBe(
		[
			// prettier-ignore
			'Product|Quantity|Cost',
			'---    |---     |--- ',
			'Dice   |1       |$100'
		].join('\n')
	);
	expect(formatTable(table)).toBe(
		[
			// prettier-ignore
			'Product Quantity Cost',
			'---     ---      --- ',
			'Dice    1        $100'
		].join('\n')
	);
});
