const rules = require("./rules");
var mongodb = require("mongodb");
const winston = require("winston");

winston.level = "debug";

// Set up database variables
let uri = process.env.MONGODB_URI;
mongodb.MongoClient.connect(uri, function(err, db) {
    if (err) winston.error(err);
    winston.debug("Connected to database server");
    let balances = db.collection("balances");

    function getBalance(requestedID) {
        // Set variable to the balance of user balance
        let balance = balances.findOne({id: requestedID})["balance"];
        return Math.round(balance);
    }
    
    function updateBalance(requestedID, newBalance) {
        balances.updateOne(
            {id: requestedID},
            {$set: {balance: Math.round(newBalance)}},
            {upsert: true},
            function() {
                return;
            }
        );
    }

    module.exports.updateBalance = updateBalance;
    module.exports.getBalance = getBalance;
    
});

function decreaseBalance(id, amount) {
    updateBalance(id, getBalance(id) - Math.round(amount));
}

function increaseBalance(id, amount) {
    updateBalance(id, getBalance(id) + Math.round(amount));
}
function winPercentage(multiplier) {
    return (100 - rules["houseEdgePercentage"]) / multiplier;
}
module.exports.decreaseBalance = decreaseBalance;
module.exports.increaseBalance = increaseBalance;
module.exports.winPercentage = winPercentage;