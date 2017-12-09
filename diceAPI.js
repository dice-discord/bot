const rules = require("./rules");
const fs = require("fs");

function updateBalance(id, newBalance) {
    // Load our target user file
    const pathToJSON = `./balances/${id}.json`;

    // Convert our data into JSON readable format and round it
    let balanceJSON = {
        balance: Math.round(newBalance)
    };
    balanceJSON = JSON.stringify(balanceJSON);

    // Write the balance to a file
    fs.writeFileSync(pathToJSON, balanceJSON);
}

function getBalance(id) {
    // Load our target user file
    const pathToJSON = `./balances/${id}.json`;

    if (fs.existsSync(pathToJSON) === false) {
        // File doesn't exist, so make one
        updateBalance(id, rules["newUserBalance"]);
    }

    const balanceJSON = JSON.parse(fs.readFileSync(pathToJSON));
    // Round number
    return Math.round(balanceJSON["balance"]);
}

function winPercentage(multiplier) {
    return (100 - rules["houseEdgePercentage"]) / multiplier;
}

module.exports.updateBalance = updateBalance;
module.exports.getBalance = getBalance;
module.exports.winPercentage = winPercentage;