const rules = require("./rules");
const fs = require("fs");

function updateBalance(id, newBalance) {
    // Load our target user file
    const pathToJSON = `../../balances/${id}`;

    // Convert our data into JSON readable format
    const balanceJSON = {
        balance: newBalance
    };
    const profile = JSON.stringify(balanceJSON);

    // Write the balance to a file
    fs.writeFile(pathToJSON, profile);
}

function getBalance(id) {
    // Load our target user file
    const pathToJSON = `../../balances/${id}`;

    if (!fs.existsSync(pathToJSON)) {
        // File doesn't exist, so make one
        updateBalance(id, rules["newUserBalance"]);
    }

    const balanceJSON = require(pathToJSON);
    return balanceJSON["balance"];
}

module.exports.updateBalance = updateBalance;
module.exports.getBalance = getBalance;