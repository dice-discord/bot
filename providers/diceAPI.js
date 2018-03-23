// Copyright 2018 Jonah Snider

const config = require('../config'),
	mongodb = require('mongodb'),
	winston = require('winston'),
	KeenTracking = require('keen-tracking');

// Set up Keen client
const keenClient = new KeenTracking({
	projectId: config.keen.projectID,
	writeKey: config.keen.writeKey
});

winston.verbose('[API] Dice API loading');
keenClient.recordEvent('events', { title: 'Dice API loading' });

// Set up database variables
const uri = config.mongoDBURI;
if(typeof config.mongoDBURI === 'undefined') {
	winston.error('[API](DATABASE) mongoDB URI is undefined!');
} else {
	winston.debug(`[API](DATABASE) mongoDB URI: ${uri}`);
}

/**
 * @param {number} multiplier Multiplier to calculate win percentage for
 * @returns {number} User balance
 */
const winPercentage = multiplier => (100 - config.houseEdgePercentage) / multiplier;
module.exports.winPercentage = winPercentage;

/**
 * @param {number} value Value to format
 * @returns {number} User balance
 */
const simpleFormat = value => {
	winston.debug(`[API](SIMPLE-FORMAT) Requested value: ${value}`);
	const result = parseFloat(parseFloat(value).toFixed(2));
	winston.debug(`[API](SIMPLE-FORMAT) Result for ${value}: ${result}`);
	return result;
};
module.exports.simpleFormat = simpleFormat;

mongodb.MongoClient.connect(uri, (err, database) => {
	if(err) winston.error(`[API](DATABASE) ${err}`);
	winston.verbose('[API](DATABASE) Connected to database server');

	const balances = database.db('balances').collection('balances');

	/**
	 * @async
	 * @param {string} requestedID Requested user ID
	 * @returns {number} User balance
	 */
	const getBalance = requestedID => balances
			.findOne({ id: requestedID })
			.then(result => {
				if(result) {
					const balanceResult = simpleFormat(result.balance);
					winston.debug(`[API](GET-BALANCE) Value of balance: ${result.balance}`);
					winston.debug(`[API](GET-BALANCE) Formatted value of balance: ${balanceResult}`);
					winston.debug(`[API](GET-BALANCE) Requested user ID: ${requestedID}`);
					return balanceResult;
				} else {
					winston.debug('[API](GET-BALANCE) Result is empty. Checking if requested ID is the house');
					if(requestedID === config.clientID) {
						winston.debug('[API](GET-BALANCE) Requested ID is the house ID');
						updateBalance(requestedID, config.houseStartingBalance);
						return config.houseStartingBalance;
					} else {
						winston.debug('[API](GET-BALANCE) Requested ID isn\'t the house ID');
						updateBalance(requestedID, config.newUserBalance);
						return config.newUserBalance;
					}
				}
			});
	module.exports.getBalance = getBalance;

	/**
	 * @param {string} requestedID Requested user ID
	 * @async
	 * @returns {boolean}
	 */
	const userExists = requestedID => balances
			.findOne({ id: requestedID })
			.then(result => {
				if(result) {
					return true;
				} else {
					return false;
				}
			});
	module.exports.userExists = userExists;

	/**
	 * @param {string} requestedID Requested user ID
	 * @param {number} newBalance New balance to set
	 * @async
	 */
	const updateBalance = (requestedID, newBalance) => {
		balances.updateOne({ id: requestedID }, { $set: { balance: simpleFormat(newBalance) } }, { upsert: true });

		winston.debug(`[API](UPDATE-BALANCE) Set balance for ${requestedID} to ${simpleFormat(newBalance)}`);
	};
	module.exports.updateBalance = updateBalance;

	/**
	 * @async
	 * @param {string} id Requested user id
	 * @param {number} amount Amount to decrease balance by
	 */
	const decreaseBalance = async(id, amount) => {
		updateBalance(id, await getBalance(id) - amount);
	};
	module.exports.decreaseBalance = decreaseBalance;

	/**
	 * @async
	 * @param {string} id Requested user id
	 * @param {number} amount Amount to increase balance by
	 */
	const increaseBalance = async(id, amount) => {
		updateBalance(id, await getBalance(id) + amount);
	};
	module.exports.increaseBalance = increaseBalance;

	/**
	 * @async
	 * This references the collection "balances", not the database
	 */
	const resetEconomy = async() => {
        // An empty search parameter will delete all items
		await balances.remove({});
		// Wait for everything to get deleted before adding more information
		updateBalance(config.clientID, config.houseStartingBalance);
	};
	module.exports.resetEconomy = resetEconomy;

	/**
	 * @async
	 * @returns {Array<Object>} Top ten data
	 */
	const leaderboard = async() => {
		const allProfiles = await balances.find();
		const formattedBalances = await allProfiles
			.sort({ balance: -1 })
			.limit(10)
			.toArray();

		winston.debug('[API](LEADERBOARD) Top ten data formatted:', formattedBalances);
		return formattedBalances;
	};
	module.exports.leaderboard = leaderboard;

	/**
	 * @async
	 * @returns {number} User count
	 */
	const totalUsers = async() => {
		const userCount = await balances.count({});
		return userCount;
	};
	module.exports.totalUsers = totalUsers;

	/**
	 * @async
	 * @param {string} requestedID Requested user ID
	 * @param {number} timestamp Unix timestamp of when the daily was used
	 */
	const setDailyUsed = (requestedID, timestamp) => {
		balances.updateOne({ id: requestedID }, { $set: { daily: timestamp } }, { upsert: true });

		// eslint-disable-next-line max-len
		winston.debug(`[API](SET-DAILY-USED) Set daily timestamp for ${requestedID} to ${new Date(timestamp)} (${timestamp})`);
	};
	module.exports.setDailyUsed = setDailyUsed;

	/**
	 * @async
	 * @param {string} requestedID Requested user ID
	 * @returns {number} timestamp Unix timestamp of when the daily was used
	 */
	const getDailyUsed = requestedID => {
		winston.debug(`[API](GET-DAILY-USED) Looking up daily timestamp for ${requestedID}`);
		return balances
			.findOne({ id: requestedID })
			.then(result => {
				if(result) winston.debug(`[API](GET-DAILY-USED) Find one result for daily timestamp: ${result.daily}`);
				if(!result || isNaN(result.daily)) {
					winston.debug('[API](GET-DAILY-USED) Daily last used timestamp result is empty.');
					return false;
				} else {
					const timestampResult = result.daily;

					winston.debug(`[API](GET-DAILY-USED) Daily timestamp: ${new Date(timestampResult)} (${timestampResult})`);
					return timestampResult;
				}
			});
	};
	module.exports.getDailyUsed = getDailyUsed;

	/**
	 * @async
	 * @returns {Array<Object>} All users
	 */
	const allUsers = async() => {
		const allProfiles = await balances.find();
		winston.debug('[API](ALL-USERS) All users were requested.');
		return allProfiles.toArray();
	};
	module.exports.allUsers = allUsers;
});
