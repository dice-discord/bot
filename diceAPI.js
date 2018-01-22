const rules = require('./rules');
const mongodb = require('mongodb');
const winston = require('winston');

winston.level = 'debug';
winston.verbose('diceAPI loading');

// Set up database variables
const uri = process.env.MONGODB_URI;
if (process.env.MONGODB_URI == null) {
	winston.error('mongoDB URI is undefined!');
} else {
	winston.debug(`mongoDB URI: ${uri}`);
}

mongodb.MongoClient.connect(uri, function(err, database) {
	if (err) winston.error(err);
	winston.debug('Connected to database server');

	const balances = database.db('balances').collection('balances');

	// Get balance
	async function getBalance(requestedID) {
		return balances
			.findOne({
				id: requestedID,
			})
			.then(result => {
				if (!result) {
					winston.debug('Result is empty. Checking if requested ID is the house.');
					if (requestedID === rules.houseID) {
						winston.debug('Requested ID is the house ID.');
						updateBalance(requestedID, rules.houseStartingBalance);
						return rules.houseStartingBalance;
					} else {
						winston.debug('Requested ID isn\'t the house ID.');
						updateBalance(requestedID, rules.newUserBalance);
						return rules.newUserBalance;
					}
				} else {
					const balanceResult = simpleFormat(result.balance);
					winston.debug(`Result for findOne: ${result}`);
					winston.debug(`Value of balance: ${result.balance}`);
					winston.debug(`Formatted value of balance: ${balanceResult}`);
					winston.debug(`Requested user ID: ${requestedID}`);
					return balanceResult;
				}
			});
	}
	module.exports.getBalance = getBalance;
	// Get balance

	// Update balance
	async function updateBalance(requestedID, newBalance) {
		balances.updateOne(
			{
				id: requestedID,
			},
			{
				$set: {
					balance: simpleFormat(newBalance),
				},
			},
			{
				upsert: true,
			}
		);
		winston.debug(`Set balance for ${requestedID} to ${simpleFormat(newBalance)}`);
	}
	module.exports.updateBalance = updateBalance;
	// Update balance

	// Increase and decrease
	async function decreaseBalance(id, amount) {
		updateBalance(id, (await getBalance(id)) - amount);
	}
	module.exports.decreaseBalance = decreaseBalance;

	async function increaseBalance(id, amount) {
		updateBalance(id, (await getBalance(id)) + amount);
	}
	module.exports.increaseBalance = increaseBalance;
	// Increase and decrease

	// Reset economy
	async function resetEconomy() {
		/* This references the collection "balances", not the database. This will not affect the "dailies" collection
        An empty search parameter will delete all items */
		await balances.remove({});
		// Wait for everything to get deleted before adding more information
		updateBalance(rules.houseID, rules.houseStartingBalance);
	}
	module.exports.resetEconomy = resetEconomy;
	// Reset economy

	// Leaderboard search
	async function leaderboard() {
		const allProfiles = await balances.find();
		const formattedBalances = await allProfiles
			.sort({
				balance: -1,
			})
			.limit(10)
			.toArray();

		winston.debug(`Top ten data: ${allProfiles}`);
		winston.debug(`Top ten data formatted: ${formattedBalances}`);
		return formattedBalances;
	}
	module.exports.leaderboard = leaderboard;
	// Leaderboard search

	// Total users
	async function totalUsers() {
		const userCount = await balances.count({});
		winston.debug(`Number of all users: ${userCount}`);
		return userCount;
	}
	module.exports.totalUsers = totalUsers;
	// Total users

	// Daily reward
	async function setDailyUsed(requestedID, timestamp) {
		balances.updateOne(
			{
				id: requestedID,
			},
			{
				$set: {
					daily: timestamp,
				},
			},
			{
				upsert: true,
			}
		);
		winston.debug(
			`Set daily timestamp for ${requestedID} to ${new Date(timestamp)} (${timestamp})`
		);
	}
	module.exports.setDailyUsed = setDailyUsed;
	// Daily reward

	// Daily reward searching
	async function getDailyUsed(requestedID) {
		winston.debug(`Looking up daily timestamp for ${requestedID}`);
		return balances
			.findOne({
				id: requestedID,
			})
			.then(result => {
				if (result) winston.debug(`Find one result for daily timestamp: ${result.daily}`);
				if (!result || isNaN(result.daily)) {
					winston.debug('Daily last used timestamp result is empty.');
					return false;
				} else {
					const timestampResult = result.daily;
					winston.debug(`Daily timestamp: ${new Date(timestampResult)} (${timestampResult})`);
					return timestampResult;
				}
			});
	}
	module.exports.getDailyUsed = getDailyUsed;
	// Daily reward searching

	// All users
	async function allUsers() {
		const allProfiles = await balances.find();
		winston.debug('All users were requested.');
		return allProfiles.toArray();
	}
	module.exports.allUsers = allUsers;
	// All users

	// User blacklist checking
	async function getBlackListLevel(requestedID) {
		winston.debug(`Looking up blacklist level for ${requestedID}`);
		return balances
			.findOne({
				id: requestedID,
			})
			.then(result => {
				if (result) winston.debug(`Find one result for blacklist level: ${result.blacklist}`);
				if (!result || isNaN(result.blacklist)) {
					winston.debug('Blacklist level result is empty, or not blacklisted.');
					return false;
				} else {
					const blacklistResult = result.blacklist;
					winston.debug(`Blacklist level: ${blacklistResult}`);
					return blacklistResult;
				}
			});
	}
	module.exports.getBlackListLevel = getBlackListLevel;
	// User blacklist checking

	// User blacklist setting
	async function setBlacklistLevel(requestedID, level) {
		balances.updateOne(
			{
				id: requestedID,
			},
			{
				$set: {
					blacklist: level,
				},
			},
			{
				upsert: true,
			}
		);
		winston.debug(`Set blacklist level for ${requestedID} to ${level}.`);
	}
	module.exports.setBlacklistLevel = setBlacklistLevel;
	// User blacklist setting
});

function winPercentage(multiplier) {
	return (100 - rules.houseEdgePercentage) / multiplier;
}
module.exports.winPercentage = winPercentage;

function simpleFormat(number) {
	return parseFloat(number.toFixed(2));
}
module.exports.simpleFormat = simpleFormat;

function simpleStringFormat(stringNumber) {
	return simpleFormat(parseFloat(stringNumber));
}
module.exports.simpleStringFormat = simpleStringFormat;
