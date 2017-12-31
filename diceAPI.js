const rules = require("./rules");
var MongoClient = require("mongodb").MongoClient;
const winston = require("winston");

winston.level = "debug";
winston.verbose("diceAPI loaded");

// Set up database variables
let uri = process.env.MONGODB_URI;
if (process.env.MONGODB_URI == null) {
    winston.error("mongoDB URI is undefined!");
} else {
    winston.verbose(`mongoDB URI: ${uri}`);
}

MongoClient.connect(uri, function (err, database) {
    if (err) winston.error(err);
    winston.debug("Connected to database server");
    winston.debug(`Database name: ${database}`);

    var balances = database.db("balances").collection("balances");

    async function getBalance(requestedID) {
        return await balances.findOne({
            id: requestedID
        })
            .then((result) => {
                if (!result) {
                    winston.verbose("Result is empty. Checking if requested ID is the house.");
                    if (requestedID === rules["houseID"]) {
                        winston.verbose("Requested ID is the house ID.");
                        updateBalance(requestedID, rules["houseStartingBalance"]);
                        return rules["houseStartingBalance"];
                    } else {
                        winston.verbose("Requested ID isn't the house ID.");
                        updateBalance(requestedID, rules["newUserBalance"]);
                        return rules["newUserBalance"];
                    }                
                } else {
                    let balanceResult = simpleFormat(result["balance"]);
                    winston.verbose(`Result for findOne: ${result}`);
                    winston.verbose(`Value of balance: ${result["balance"]}`);
                    winston.verbose(`Formatted value of balance: ${balanceResult}`);
                    winston.verbose(`Requested user ID: ${requestedID}`);
                    return balanceResult;
                }
            });
    }
    module.exports.getBalance = getBalance;

    // Update balance
    async function updateBalance(requestedID, newBalance) {
        balances.updateOne({
            id: requestedID
        }, {
            $set: {
                balance: simpleFormat(newBalance)
            }
        }, {
            upsert: true
        });
        winston.verbose(`Set balance for ${requestedID} to ${newBalance}`);
    }
    module.exports.updateBalance = updateBalance;
    // Update balance
    
    // Increase and decrease
    async function decreaseBalance(id, amount) {
        updateBalance(id, await getBalance(id) - amount);
    }
    module.exports.decreaseBalance = decreaseBalance;

    async function increaseBalance(id, amount) {
        updateBalance(id, await getBalance(id) + amount);
    }
    module.exports.increaseBalance = increaseBalance;
    // Increase and decrease

    // Reset economy
    async function resetEconomy() {
        /* This references the collection "balances", not the database. This will not affect the "dailies" collection
        An empty search parameter will delete all items */
        await balances.remove({});
        // Wait for everything to get deleted before adding more information
        updateBalance(rules["houseID"], rules["houseStartingBalance"]);
    }
    module.exports.resetEconomy = resetEconomy;
    // Reset economy
});

function winPercentage(multiplier) {
    return (100 - rules["houseEdgePercentage"]) / multiplier;
}
module.exports.winPercentage = winPercentage;

function simpleFormat(number) {
    return parseFloat((number).toFixed(2));
}
module.exports.simpleFormat = simpleFormat;

function simpleStringFormat(stringNumber) {
    return simpleFormat(parseFloat(stringNumber));
}
module.exports.simpleStringFormat = simpleStringFormat;