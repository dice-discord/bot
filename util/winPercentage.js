// Copyright Jonah Snider 2018

const config = require('../config');
/**
 * @name winPercentage
 * @param {number} multiplier Multiplier to calculate win percentage for
 * @param {User} user User to calculate win percentage for
 * @returns {number} User balance
 */
module.exports = (multiplier, user) => {
  // Load the default setting
  let { houseEdgePercentage } = config;

  // If they're a crown supporter, set it to the patron percentage
  if (config.patrons[user.id] && config.patrons[user.id].crown === true) houseEdgePercentage = 0;

  return (100 - houseEdgePercentage) / multiplier;
};
