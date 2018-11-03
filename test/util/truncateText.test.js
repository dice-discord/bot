/* global test expect */
const truncateText = require('../../src/util/truncateText');

test('doesn\'t truncate already short text', () => {
  expect(truncateText('string')).toBe('string');
});
