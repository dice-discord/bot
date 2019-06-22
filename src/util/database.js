/*
Copyright 2019 Jonah Snider

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
const logger = require("./logger").scope("database");
const KeenTracking = require("keen-tracking");

logger.start("Database loading");

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
  await mongo.connect();
  logger.timeEnd("database");
  logger.start("Connected to database server");
  const db = mongo.db("dice");

  const economyCollection = db.collection("economy");
  const dailiesCollection = db.collection("dailies");

  const balances = {
    /**
     * @param {string} id User ID to get the balance for
     * @param {Boolean} setDefault Whether or not to set the user's balance to the default
     * @returns {Promise<Number>} Promise resolving in the balance of the user
     */
    get: async (id, setDefault = true) => {
      const getBalanceLogger = logger.scope("balances", "get");
      const result = await economyCollection.findOne({ key: `keyv:${id}` });
      const defaultBal = id === config.clientID ? config.houseStartingBalance : config.newUserBalance;

      if (result && result.value && typeof result.value.value !== "undefined") {
        const bal = simpleFormat(result.value.value);

        getBalanceLogger.debug({ prefix: id, message: bal });

        return bal;
      } else {
        getBalanceLogger.debug({ prefix: id, message: "default" });

        if (setDefault) await balances.set(id, defaultBal);

        return defaultBal;
      }
    },
    set: (id, balance) => {
      const setBalanceLogger = logger.scope("balances", "set");

      setBalanceLogger.debug({ prefix: id, message: balance });

      return economyCollection.findOneAndUpdate(
        { key: `keyv:${id}` },
        { $set: { value: { value: balance } } },
        { upsert: true }
      );
    },
    decrease: async (id, amount) => {
      const decreaseBalanceLogger = logger.scope("balances", "decrease");

      decreaseBalanceLogger.debug({ prefix: id, message: amount });
      return balances.set(id, (await balances.get(id)) - amount);
    },
    increase: async (id, amount) => {
      const increaseBalanceLogger = logger.scope("balances", "decrease");

      increaseBalanceLogger.debug({ prefix: id, message: amount });
      return balances.set(id, (await balances.get(id)) + amount);
    }
  };
  module.exports.balances = balances;

  /**
   * @param {string} id Requested user ID
   * @returns {boolean}
   */
  const userExists = async id => Boolean((await economyCollection.findOne({ key: `keyv:${id}` })).value.value);
  module.exports.userExists = userExists;

  /**
   * Reset the economy
   */
  const resetEconomy = () => Promise.all([economyCollection.drop(), dailiesCollection.drop()]);
  module.exports.resetEconomy = resetEconomy;

  /**
   * @returns {Array<Object>} Top ten data
   */
  const leaderboard = async () => {
    const leaderboardLogger = logger.scope("database", "leaderboard");
    const formattedBalances = await economyCollection
      .find()
      .sort({ value: -1 })
      .limit(10)
      .toArray();

    leaderboardLogger.debug("Top ten data formatted:", JSON.stringify(formattedBalances));
    return formattedBalances;
  };
  module.exports.leaderboard = leaderboard;

  /**
   * @returns {Promise<number>} User count
   */
  const userCount = () => economyCollection.countDocuments();
  module.exports.userCount = userCount;

  /**
   * @param {string} id Requested user ID
   * @param {number} timestamp Unix timestamp of when the daily was used
   */
  const setDailyUsed = (id, timestamp) => {
    const setDailyUsedLogger = logger.scope("daily used", "set");
    setDailyUsedLogger.debug(`Setting daily timestamp for ${id} to ${new Date(timestamp)} (${timestamp})`);
    return dailiesCollection.findOneAndUpdate({ key: `keyv:${id}` }, { $set: { value: { value: timestamp } } }, { upsert: true });
  };
  module.exports.setDailyUsed = setDailyUsed;

  /**
   * @param {string} id Requested user ID
   */
  const getDailyUsed = async id => {
    const result = await dailiesCollection.findOne({ key: `keyv:${id}` });
    console.log(`[AAAAAA] search query: { key: \`keyv:${id}\` }`)
    console.log(`[AAAAAA] getting daily for ${id}. result: ${result}`);

    return result && result.value && typeof result.value.value !== "undefined" ? result.value.value : 0;
  };
  module.exports.getDailyUsed = getDailyUsed;
};

database();
