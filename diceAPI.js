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
    //const balancesdb = database.db("balances");
    var balances = database.db("balances").collection("balances");

    async function getBalance(requestedID) {
        return await balances.findOne({
            id: requestedID
        })
            .then((result) => {
                if (!result) {
                    winston.verbose("Result is empty");
                    updateBalance(requestedID, rules["newUserBalance"]);
                    return rules["newUserBalance"];
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
    }

    module.exports.updateBalance = updateBalance;
    module.exports.getBalance = getBalance;

    async function decreaseBalance(id, amount) {
        updateBalance(id, await getBalance(id) - Math.round(amount));
    }

    async function increaseBalance(id, amount) {
        updateBalance(id, await getBalance(id) + Math.round(amount));
    }

    module.exports.decreaseBalance = decreaseBalance;
    module.exports.increaseBalance = increaseBalance;
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