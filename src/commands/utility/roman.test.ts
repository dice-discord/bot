import RomanCommand from './roman';

test('romanToDecimal', () => {
	expect(() => RomanCommand.romanToDecimal('invalid')).toThrowError(RangeError);

	// 1-9
	expect(RomanCommand.romanToDecimal('I')).toBe(1);
	expect(RomanCommand.romanToDecimal('II')).toBe(2);
	expect(RomanCommand.romanToDecimal('III')).toBe(3);
	expect(RomanCommand.romanToDecimal('IIII')).toBe(4);
	expect(RomanCommand.romanToDecimal('IV')).toBe(4);
	expect(RomanCommand.romanToDecimal('V')).toBe(5);
	expect(RomanCommand.romanToDecimal('VI')).toBe(6);
	expect(RomanCommand.romanToDecimal('VII')).toBe(7);
	expect(RomanCommand.romanToDecimal('VIII')).toBe(8);
	expect(RomanCommand.romanToDecimal('VIIII')).toBe(9);
	expect(RomanCommand.romanToDecimal('IX')).toBe(9);

	// Multiples of 10, from 10 to 90
	expect(RomanCommand.romanToDecimal('X')).toBe(10);
	expect(RomanCommand.romanToDecimal('XX')).toBe(20);
	expect(RomanCommand.romanToDecimal('XXX')).toBe(30);
	expect(RomanCommand.romanToDecimal('XL')).toBe(40);
	expect(RomanCommand.romanToDecimal('L')).toBe(50);
	expect(RomanCommand.romanToDecimal('LX')).toBe(60);
	expect(RomanCommand.romanToDecimal('LXX')).toBe(70);
	expect(RomanCommand.romanToDecimal('LXXX')).toBe(80);
	expect(RomanCommand.romanToDecimal('XC')).toBe(90);

	// Multiples of 100, 100 to 900
	expect(RomanCommand.romanToDecimal('C')).toBe(100);
	expect(RomanCommand.romanToDecimal('CC')).toBe(200);
	expect(RomanCommand.romanToDecimal('CCC')).toBe(300);
	expect(RomanCommand.romanToDecimal('CD')).toBe(400);
	expect(RomanCommand.romanToDecimal('D')).toBe(500);
	expect(RomanCommand.romanToDecimal('DC')).toBe(600);
	expect(RomanCommand.romanToDecimal('DCC')).toBe(700);
	expect(RomanCommand.romanToDecimal('DCCC')).toBe(800);
	expect(RomanCommand.romanToDecimal('CM')).toBe(900);

	expect(RomanCommand.romanToDecimal('M')).toBe(1000);
	expect(RomanCommand.romanToDecimal('MM')).toBe(2000);
	expect(RomanCommand.romanToDecimal('MMM')).toBe(3000);
});

test('decimalToRoman', () => {
	expect(() => RomanCommand.decimalToRoman(1.25)).toThrowError(RangeError);
	expect(() => RomanCommand.decimalToRoman(-1)).toThrowError(RangeError);

	// 1-9
	expect(RomanCommand.decimalToRoman(1)).toBe('I');
	expect(RomanCommand.decimalToRoman(2)).toBe('II');
	expect(RomanCommand.decimalToRoman(3)).toBe('III');
	expect(RomanCommand.decimalToRoman(4)).toBe('IV');
	expect(RomanCommand.decimalToRoman(5)).toBe('V');
	expect(RomanCommand.decimalToRoman(6)).toBe('VI');
	expect(RomanCommand.decimalToRoman(7)).toBe('VII');
	expect(RomanCommand.decimalToRoman(8)).toBe('VIII');
	expect(RomanCommand.decimalToRoman(9)).toBe('IX');

	// Multiples of 10, from 10 to 90
	expect(RomanCommand.decimalToRoman(10)).toBe('X');
	expect(RomanCommand.decimalToRoman(20)).toBe('XX');
	expect(RomanCommand.decimalToRoman(30)).toBe('XXX');
	expect(RomanCommand.decimalToRoman(40)).toBe('XL');
	expect(RomanCommand.decimalToRoman(50)).toBe('L');
	expect(RomanCommand.decimalToRoman(60)).toBe('LX');
	expect(RomanCommand.decimalToRoman(70)).toBe('LXX');
	expect(RomanCommand.decimalToRoman(80)).toBe('LXXX');
	expect(RomanCommand.decimalToRoman(90)).toBe('XC');

	// Multiples of 100, 100 to 900
	expect(RomanCommand.decimalToRoman(100)).toBe('C');
	expect(RomanCommand.decimalToRoman(200)).toBe('CC');
	expect(RomanCommand.decimalToRoman(300)).toBe('CCC');
	expect(RomanCommand.decimalToRoman(400)).toBe('CD');
	expect(RomanCommand.decimalToRoman(500)).toBe('D');
	expect(RomanCommand.decimalToRoman(600)).toBe('DC');
	expect(RomanCommand.decimalToRoman(700)).toBe('DCC');
	expect(RomanCommand.decimalToRoman(800)).toBe('DCCC');
	expect(RomanCommand.decimalToRoman(900)).toBe('CM');

	expect(RomanCommand.decimalToRoman(1000)).toBe('M');
	expect(RomanCommand.decimalToRoman(2000)).toBe('MM');
	expect(RomanCommand.decimalToRoman(3000)).toBe('MMM');
});
