// Copyright 2018 Jonah Snider

const logger = require('../providers/logger').scope('simple format');

/**
 * @name simpleFormat
 * @param {number|string} value Value to format
 * @returns {number} A number in fixed-point notation up to 2 decimal points
 */
module.exports = value => {
  logger.debug(`Requested value: ${value}`);
  const result = parseFloat(parseFloat(value).toFixed(2));
  logger.debug(`Result for ${value}: ${result}`);
  return result;
};
