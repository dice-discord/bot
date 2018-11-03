/* global test expect */
const simpleFormat = require('../../util/simpleFormat');

test('doesn\'nt do anything when number is short enough', () => {
  expect(simpleFormat(5)).toBe(5);
});

test('rounds to 2 digits', () => {
  expect(simpleFormat(7.6423)).toBe(7.64);
  expect(simpleFormat(-53.2492)).toBe(-53.25);
});
