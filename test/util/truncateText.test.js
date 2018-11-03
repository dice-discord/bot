/* global test expect */
const truncateText = require('../../util/truncateText');

test('doesn\'t truncate already short text', () => {
  expect(truncateText('string')).toBe('string');
});
