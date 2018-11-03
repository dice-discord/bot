/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
