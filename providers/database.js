// Copyright 2018 Jonah Snider

const config = require('../config');
const simpleFormat = require('../util/simpleFormat');
const mongodb = require('mongodb');
const logger = require('./logger').scope('database');
const KeenTracking = require('keen-tracking');

// Set up Keen client
const keenClient = new KeenTracking({
  projectId: config.keen.projectID,
  writeKey: config.keen.writeKey
});

logger.start('Database loading');
keenClient.recordEvent('events', { title: 'Database loading' });

// Set up database variables
const uri = config.mongoDBURI;
if (typeof config.mongoDBURI === 'undefined') {
  logger.error('mongoDB URI is undefined!');
}

logger.time('database');
mongodb.MongoClient
  .connect(uri, { useNewUrlParser: true })
  .then(client => {
    logger.timeEnd('database');
    logger.start('Connected to database server');

    const balancesCollection = client.db('balances').collection('balances');

    const balances = {
    /**
     * @name balances.get
     * @async
     * @param {string} requestedID Requested user ID
     * @returns {number} User balance
     */
      get: requestedID => {
        const balancesGetLogger = logger.scope('balances', 'get');
        return balancesCollection
          .findOne({ id: requestedID })
          .then(result => {
            if (result) {
              const balanceResult = simpleFormat(result.balance);
              balancesGetLogger.debug('Value of balance:', result.balance);
              balancesGetLogger.debug('Formatted value of balance:', balanceResult);
              balancesGetLogger.debug('Requested user ID:', requestedID);
              return balanceResult;
            }
            balancesGetLogger.debug('Result is empty. Checking if requested ID is the house');
            if (requestedID === config.clientID) {
              balancesGetLogger.debug('Requested ID is the house ID');
              balances.update(requestedID, config.houseStartingBalance);
              return config.houseStartingBalance;
            }
            balancesGetLogger.debug('Requested ID isn\'t the house ID');
            balances.update(requestedID, config.newUserBalance);
            return config.newUserBalance;
          });
      },
      /**
     * @async
     * @param {string} requestedID Requested user ID
     * @param {number} newBalance New balance to set
     * @returns {Promise<UpdateWriteOpResult>} Promise from MongoDB
     */
      update: (requestedID, newBalance) => {
        const balancesUpdateLogger = logger.scope('balances', 'update');
        const result = balancesCollection.updateOne(
          { id: requestedID },
          { $set: { balance: simpleFormat(newBalance) } },
          { upsert: true }
        );

        balancesUpdateLogger.debug(`Set balance for ${requestedID} to ${simpleFormat(newBalance)}`);
        return result;
      },
      /**
     * @async
     * @param {string} id Requested user id
     * @param {number} amount Amount to decrease balance by
     * @returns {Function<Promise<UpdateWriteOpResult>>} The update balance function which returns a promise
     */
      decrease: async (id, amount) => balances.update(id, await balances.get(id) - amount),
      /**
     * @async
     * @param {string} id Requested user id
     * @param {number} amount Amount to increase balance by
     * @returns {Function<Promise<UpdateWriteOpResult>>} The update balance function which returns a promise
     */
      increase: async (id, amount) => balances.update(id, await balances.get(id) + amount)
    };
    module.exports.balances = balances;

    /**
   * @param {string} requestedID Requested user ID
   * @async
   * @returns {boolean}
   */
    const userExists = requestedID => balancesCollection
      .findOne({ id: requestedID })
      .then(result => Boolean(result));
    module.exports.userExists = userExists;

    /**
   * @async
   * This references the collection "balances", not the database
   */
    const resetEconomy = async () => {
    // An empty search parameter will delete all items
      await balancesCollection.remove({});
      // Wait for everything to get deleted before adding more information
      balances.update(config.clientID, config.houseStartingBalance);
    };
    module.exports.resetEconomy = resetEconomy;

    /**
   * @async
   * @returns {Array<Object>} Top ten data
   */
    const leaderboard = async () => {
      logger.scope('database', 'leaderboard');
      const allProfiles = await balancesCollection.find();
      const formattedBalances = await allProfiles
        .sort({ balance: -1 })
        .limit(10)
        .toArray();

      logger.debug('Top ten data formatted:', JSON.stringify(formattedBalances));
      return formattedBalances;
    };
    module.exports.leaderboard = leaderboard;

    /**
   * @async
   * @returns {number} User count
   */
    const totalUsers = async () => {
      const userCount = await balancesCollection.count({});
      return userCount;
    };
    module.exports.totalUsers = totalUsers;

    /**
   * @async
   * @param {string} requestedID Requested user ID
   * @param {number} timestamp Unix timestamp of when the daily was used
   * @returns {Promise<UpdateWriteOpResult>} Promise from MongoDB
   */
    const setDailyUsed = (requestedID, timestamp) => {
      const setDailyUsedLogger = logger.scope('daily used', 'set');
      const result = balancesCollection.updateOne({ id: requestedID }, { $set: { daily: timestamp } }, { upsert: true });

      // eslint-disable-next-line max-len
      setDailyUsedLogger.debug(`Set daily timestamp for ${requestedID} to ${new Date(timestamp)} (${timestamp})`);

      return result;
    };
    module.exports.setDailyUsed = setDailyUsed;

    /**
   * @async
   * @param {string} requestedID Requested user ID
   * @returns {number|boolean} Unix timestamp of when the daily was used or a boolean (false) if daily was never used
   */
    const getDailyUsed = requestedID => {
      const getDailyUsedLogger = logger.scope('daily used', 'get');
      getDailyUsedLogger.debug(`Looking up daily timestamp for ${requestedID}`);
      return balancesCollection
        .findOne({ id: requestedID })
        .then(result => {
          if (result) getDailyUsedLogger.debug('Find one result for daily timestamp:', result.daily);
          if (!result || isNaN(result.daily)) {
            getDailyUsedLogger.debug('Daily last used timestamp result is empty.');
            return false;
          }
          const timestampResult = result.daily;

          getDailyUsedLogger.debug(`Daily timestamp: ${new Date(timestampResult)} (${timestampResult})`);
          return timestampResult;
        });
    };
    module.exports.getDailyUsed = getDailyUsed;

    /**
   * @async
   * @returns {Array<Object>} All users
   */
    const allUsers = async () => {
      const allUsersLogger = logger.scope('database', 'all users');
      const allProfiles = await balancesCollection.find();
      allUsersLogger.debug('All users were requested.');
      return allProfiles.toArray();
    };
    module.exports.allUsers = allUsers;
  });
