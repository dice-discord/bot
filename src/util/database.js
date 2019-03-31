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

const config = require("../config");
const simpleFormat = require("./simpleFormat");
const { MongoClient } = require("mongodb");
const Keyv = require("keyv");
const logger = require("./logger").scope("database");
const KeenTracking = require("keen-tracking");

// Note: We use ms to get 1 year in milliseconds, and we do that to have user profiles expire after a year of inactivity.
const ms = require("ms");

logger.start("Database loading");

const echo = data => data;

const economy = new Keyv(config.backend, {
  serialize: echo,
  deserialize: echo,
  collection: "economy"
});
const dailies = new Keyv(config.backend, {
  serialize: echo,
  deserialize: echo,
  collection: "dailies"
});

// Set up Keen client
const keenClient = new KeenTracking({
  projectId: config.keen.projectID,
  writeKey: config.keen.writeKey
});

keenClient.recordEvent("events", { title: "Database loading" });

// Set up database variables
const uri = config.mongoDBURI;
if (typeof config.mongoDBURI === "undefined") {
  logger.error("mongoDB URI is undefined!");
}

const database = async () => {
  logger.time("database");
  const mongo = new MongoClient(uri);
  await mongo.connect(null, { useNewUrlParser: true });
  logger.timeEnd("database");
  logger.start("Connected to database server");
  const db = mongo.db("dice");

  const economyCollection = db.collection("economy");

  const balances = {
    /**
     * @param {string} id User ID to get the balance for
     * @returns {Promise<Number>} Promise resolving in the balance of the user
     */
    get: async id => {
      const userBalance = await economy.get(id);
      const defaultBal = id === config.clientID ? config.houseStartingBalance : config.newUserBalance;

      if (typeof userBalance === "undefined") {
        await economy.set(id, defaultBal, ms("1 year"));
        return defaultBal;
      } else {
        return userBalance;
      }
    },
    set: (id, newBalance) => {
      logger.scope("balances", "set").debug({ prefix: id, message: simpleFormat(newBalance) });
      return economy.set(id, newBalance, ms("1 year"));
    },
    decrease: async (id, amount) => this.balances.increase(id, -amount),
    increase: async (id, amount) => balances.set(id, (await balances.get(id)) + amount)
  };
  module.exports.balances = balances;

  /**
   * @param {string} requestedID Requested user ID
   * @returns {boolean}
   */
  const userExists = async requestedID => Boolean(await economy.get(requestedID));
  module.exports.userExists = userExists;

  /**
   * Reset the economy
   */
  const resetEconomy = () => Promise.all([economy.clear(), dailies.clear()]);
  module.exports.resetEconomy = resetEconomy;

  /**
   * @returns {Array<Object>} Top ten data
   */
  const leaderboard = async () => {
    logger.scope("database", "leaderboard");
    const allProfiles = await economyCollection.find();
    const formattedBalances = await allProfiles
      .sort({ value: -1 })
      .limit(10)
      .toArray();

    logger.debug("Top ten data formatted:", JSON.stringify(formattedBalances));
    return formattedBalances;
  };
  module.exports.leaderboard = leaderboard;

  /**
   * @returns {Promise<number>} User count
   */
  const userCount = () => economyCollection.countDocuments({});
  module.exports.userCount = userCount;

  /**
   * @param {string} id Requested user ID
   * @param {number} timestamp Unix timestamp of when the daily was used
   */
  const setDailyUsed = (id, timestamp) => {
    const setDailyUsedLogger = logger.scope("daily used", "set");
    setDailyUsedLogger.debug(`Set daily timestamp for ${id} to ${new Date(timestamp)} (${timestamp})`);
    return dailies.set(id, timestamp, ms("1 year"));
  };
  module.exports.setDailyUsed = setDailyUsed;

  /**
   * @param {string} requestedID Requested user ID
   */
  const getDailyUsed = requestedID => dailies.get(requestedID);
  module.exports.getDailyUsed = getDailyUsed;
};

database();
