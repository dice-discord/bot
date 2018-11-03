/**
 * @name wait
 * @param {number} delay  Delay in milliseconds to wait for
 * @returns {Promise<resolve>}
 */
module.exports = delay => new Promise(resolve => setTimeout(resolve, delay));
