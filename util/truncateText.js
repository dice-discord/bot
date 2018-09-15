// Copyright Jonah Snider 2018

/**
 * @function
 * @name truncateText
 * @param {string} string String to truncate
 * @returns {string} Truncated string or original if string was short enough to begin with
 */
// eslint-disable-next-line no-extra-parens
module.exports = string => (string.length > 2048 ? `${string.substring(0, 2045)}...` : string);
