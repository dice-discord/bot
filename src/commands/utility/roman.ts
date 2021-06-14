import {Sort, sortObject} from '@jonahsnider/util';
import {Argument, ParsedValuePredicate} from 'discord-akairo';
import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

/** A valid character from a Roman numeral. */
type RomanNumeralCharacter = 'M' | 'D' | 'C' | 'L' | 'X' | 'V' | 'I';
type ExtraRomanNumeralCharacter = RomanNumeralCharacter | 'CM' | 'CD' | 'XC' | 'XL' | 'IX' | 'IV';

/** Conversion table of Roman numeral values and their decimal counter parts. */
const conversion: Record<RomanNumeralCharacter, number> = {
	M: 1000,
	D: 500,
	C: 100,
	L: 50,
	X: 10,
	V: 5,
	I: 1
};

// TODO: Remove the double character values (ex. `XC`) and rewrite the algorithm to properly output them
/** Roman numeral conversion table with helper values (ex. `IV = 4`) */
const unsortedExtraConversion: Record<ExtraRomanNumeralCharacter, number> = {...conversion, CM: 900, CD: 400, XC: 90, XL: 40, IX: 9, IV: 4};

// This sorts by value descending to counteract the spread operator ruining the order of elements from above
const extraConversion = Object.fromEntries(sortObject(unsortedExtraConversion, Sort.descending));

/** Regular expression for Roman numerals. Case sensitive. */
export const romanRegExp = /^[MDCLXVI]+$/;

/**
 * Check if the argument value is a valid decimal or Roman numeral (case-insensitive).
 */
export const validator: ParsedValuePredicate = (message: Message, phrase: string, value: number | string): boolean =>
	typeof value === 'string' ? romanRegExp.test(phrase.toUpperCase()) : true;

export default class RomanCommand extends DiceCommand {
	constructor() {
		super('roman', {
			aliases: ['roman-numerals', 'convert-roman-numerals', 'convert-from-roman-numerals', 'convert-to-roman-numerals'],
			description: {content: 'Convert to or from Roman numerals.', usage: '<value>', examples: ['XIV', '4', 'iii']},
			category: DiceCommandCategories.Util,
			args: [
				{
					id: 'value',
					match: 'content',
					type: Argument.validate(Argument.union(AkairoArgumentType.Integer, AkairoArgumentType.Uppercase), validator),
					otherwise: ['Invalid value provided', 'Please provide Roman numerals or a whole number to convert'].join('\n'),
					prompt: {start: 'What number would you like to convert?'}
				}
			]
		});
	}

	/**
	 * Convert roman numerals to decimal numbers.
	 * @param roman Roman numerals to convert
	 * @returns Decimal representation of provided numeral
	 * @example romanToDecimal('XIV');
	 */
	public static romanToDecimal(roman: string | RomanNumeralCharacter): number {
		const romanNumeralsRegExp = romanRegExp;

		if (!romanNumeralsRegExp.test(roman)) {
			throw new RangeError(`Invalid Roman numerals provided, should match regular expression ${romanNumeralsRegExp.source}`);
		}

		if (roman.length === 1) {
			return conversion[roman as RomanNumeralCharacter];
		}

		let decimal = 0;

		const values = (roman.split('') as RomanNumeralCharacter[]).map(char => conversion[char]);

		for (let i = 0; i < values.length; i++) {
			const first = values[i];
			const next = values[i + 1] ?? 0;

			if (first < next) {
				i++;
				decimal += next - first;
			} else {
				decimal += first;
			}
		}

		return decimal;
	}

	/**
	 * Convert a decimal number to Roman numerals
	 * @param number Decimal to convert to Roman numerals
	 * @returns Roman numeral representation of provided decimal
	 * @example decimalToRoman(10);
	 */
	public static decimalToRoman(number: number): string | RomanNumeralCharacter {
		if (number % 1 !== 0) {
			throw new RangeError('Invalid decimal number provided, expected integer');
		} else if (number < 1) {
			throw new RangeError('Invalid decimal number provided, expected integer above 0');
		}

		let result: string | RomanNumeralCharacter = '';

		while (number !== 0) {
			for (const char in extraConversion) {
				if (Object.prototype.hasOwnProperty.call(extraConversion, char)) {
					const value = extraConversion[char as RomanNumeralCharacter];

					if (value <= number) {
						number -= value;
						result += char;
						break;
					}
				}
			}
		}

		return result;
	}

	async exec(message: Message, args: {value: string | number}): Promise<Message | undefined> {
		if (typeof args.value === 'number') {
			if (args.value < 1) {
				return message.util?.send(['Invalid value provided', 'Please provide a whole number greater than 0'].join('\n'));
			}

			if (args.value > 3999) {
				return message.util?.send(['Invalid value provided', 'Please provide a whole number less than 4,000'].join('\n'));
			}

			return message.util?.send(RomanCommand.decimalToRoman(args.value));
		}

		return message.util?.send(RomanCommand.romanToDecimal(args.value).toLocaleString());
	}
}
