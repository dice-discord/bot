// Copyright 2018 Jonah Snider

const rules = require('../rules');
const mongodb = require('mongodb');
const winston = require('winston');
winston.verbose('[API] Dice API loading');

// Set up database variables
const uri = process.env.MONGODB_URI;
if (process.env.MONGODB_URI == null) {
	winston.error('[API](DATABASE) mongoDB URI is undefined!');
} else {
	winston.debug(`[API](DATABASE) mongoDB URI: ${uri}`);
}

const winPercentage = multiplier => {
	return (100 - rules.houseEdgePercentage) / multiplier;
};
module.exports.winPercentage = winPercentage;

const simpleFormat = value => {
	winston.debug(`[API](SIMPLE-FORMAT) Requested value: ${value}`);
	const result = parseFloat(parseFloat(value).toFixed(2));
	winston.debug(`[API](SIMPLE-FORMAT) Result for ${value}: ${result}`);
	return result;
};
module.exports.simpleFormat = simpleFormat;

mongodb.MongoClient.connect(uri, function(err, database) {
	if (err) winston.error(`[API](DATABASE) ${err}`);
	winston.verbose('[API](DATABASE) Connected to database server');

	const balances = database.db('balances').collection('balances');
	const storage = database.db('storage').collection('storage');

	// Get balance
	const getBalance = async requestedID => {
		return balances
			.findOne({
				id: requestedID
			})
			.then(result => {
				if (result) {
					const balanceResult = simpleFormat(result.balance);
					winston.debug(`[API](GET-BALANCE) Value of balance: ${result.balance}`);
					winston.debug(`[API](GET-BALANCE) Formatted value of balance: ${balanceResult}`);
					winston.debug(`[API](GET-BALANCE) Requested user ID: ${requestedID}`);
					return balanceResult;
				} else {
					winston.debug('[API](GET-BALANCE) Result is empty. Checking if requested ID is the house.');
					if (requestedID === rules.houseID) {
						winston.debug('[API](GET-BALANCE) Requested ID is the house ID.');
						updateBalance(requestedID, rules.houseStartingBalance);
						return rules.houseStartingBalance;
					} else if (requestedID === 'lottery') {
						winston.debug('[API](GET-BALANCE) Requested ID is the lottery.');
						return 0;
					} else {
						winston.debug('[API](GET-BALANCE) Requested ID isn\'t the house ID or the lottery ID.');
						updateBalance(requestedID, rules.newUserBalance);
						return rules.newUserBalance;
					}
				}
			});
	};
	module.exports.getBalance = getBalance;
	// Get balance

	// Update balance
	const updateBalance = async (requestedID, newBalance) => {
		balances.updateOne({
			id: requestedID
		}, {
			$set: {
				balance: simpleFormat(newBalance)
			}
		}, {
			upsert: true
		});

		winston.debug(`[API](UPDATE-BALANCE) Set balance for ${requestedID} to ${simpleFormat(newBalance)}`);
	};
	module.exports.updateBalance = updateBalance;
	// Update balance

	// Increase and decrease
	const decreaseBalance = async (id, amount) => {
		updateBalance(id, await getBalance(id) - amount);
	};
	module.exports.decreaseBalance = decreaseBalance;

	const increaseBalance = async (id, amount) => {
		updateBalance(id, await getBalance(id) + amount);
	};
	module.exports.increaseBalance = increaseBalance;
	// Increase and decrease

	// Reset economy
	const resetEconomy = async () => {
		/* This references the collection "balances", not the database. This will not affect the "dailies" collection
        An empty search parameter will delete all items */
		await balances.remove({});
		// Wait for everything to get deleted before adding more information
		updateBalance(rules.houseID, rules.houseStartingBalance);
	};
	module.exports.resetEconomy = resetEconomy;
	// Reset economy

	// Leaderboard
	const leaderboard = async () => {
		const allProfiles = await balances.find();
		const formattedBalances = await allProfiles
			.sort({
				balance: -1
			})
			.limit(10)
			.toArray();

		winston.debug('[API](LEADERBOARD) Top ten data formatted:', formattedBalances);
		return formattedBalances;
	};
	module.exports.leaderboard = leaderboard;
	// Leaderboard

	// Total users
	const totalUsers = async () => {
		const userCount = await balances.count({});
		return userCount;
	};
	module.exports.totalUsers = totalUsers;
	// Total users

	// Daily reward
	const setDailyUsed = async (requestedID, timestamp) => {
		balances.updateOne({
			id: requestedID
		}, {
			$set: {
				daily: timestamp
			}
		}, {
			upsert: true
		});

		winston.debug(`[API](SET-DAILY-USED) Set daily timestamp for ${requestedID} to ${new Date(timestamp)} (${timestamp})`);
	};
	module.exports.setDailyUsed = setDailyUsed;
	// Daily reward

	// Daily reward timestamp fetching
	const getDailyUsed = async requestedID => {
		winston.debug(`[API](GET-DAILY-USED) Looking up daily timestamp for ${requestedID}`);
		return balances
			.findOne({
				id: requestedID
			})
			.then(result => {
				if (result) winston.debug(`[API](GET-DAILY-USED) Find one result for daily timestamp: ${result.daily}`);
				if (!result || isNaN(result.daily)) {
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
	// Daily reward timestamp fetching

	// All users
	const allUsers = async () => {
		const allProfiles = await balances.find();
		winston.debug('[API](ALL-USERS) All users were requested.');
		return allProfiles.toArray();
	};
	module.exports.allUsers = allUsers;
	// All users

	// Top wins leaderboard search
	const topWinsLeaderboard = async () => {
		const allProfiles = storage.find();
		const formattedBiggestWins = await allProfiles
			.sort({
				biggestWin: -1
			})
			.limit(10)
			.toArray();

		winston.debug(`[API] Top ten wins formatted: ${formattedBiggestWins}`);
		return formattedBiggestWins;
	};
	module.exports.topWinsLeaderboard = topWinsLeaderboard;
	// Top wins leaderboard search

	// Get biggest win
	const getBiggestWin = async requestedID => {
		return storage
			.findOne({
				id: requestedID
			})
			.then(result => {
				if (result) {
					const biggestWinResult = simpleFormat(result.biggestWin);
					winston.debug(`[API] Value of biggest win: ${result.biggestWin}`);
					winston.debug(`[API] Formatted value of biggest win: ${biggestWinResult}`);
					winston.debug(`[API] Requested user ID: ${requestedID}`);
					return biggestWinResult;
				} else {
					winston.debug('[API] Biggest win result is empty.');
					updateBiggestWin(requestedID, 0);
					return 0;
				}
			});
	};
	module.exports.getBiggestWin = getBiggestWin;
	// Get biggest win

	// Update biggest win
	const updateBiggestWin = async (requestedID, newBiggestWin) => {
		storage.updateOne({
			id: requestedID
		}, {
			$set: {
				biggestWin: simpleFormat(newBiggestWin)
			}
		}, {
			upsert: true
		});
		winston.debug(`[API] Set biggest win for ${requestedID} to ${simpleFormat(newBiggestWin)}`);
	};
	module.exports.updateBiggestWin = updateBiggestWin;
	// Update biggest win
});
