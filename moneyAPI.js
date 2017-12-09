const rules = require("./rules");

function updateBalance(id, newBalance) {
    // Load our target user file
    const pathToJSON = `../../balances/${id}`;

    // Convert our data into JSON readable format
    var balanceJSON = {
        balance: newBalance
    };
    var profile = JSON.stringify(balanceJSON);

    // Write the balance to a file
    fs.writeFile(pathToJSON, profile);
};

function getBalance(id) {
    // Load our target user file
    const pathToJSON = `../../balances/${id}`;

    if (!fs.existsSync(`../../balances/${id}`)) {
        // File doesn't exist, so make one
        updateBalance(id, rules["newUserBalance"]);
    }

    balanceJSON = require(pathToJSON);
    return balanceJSON["balance"];
};

module.exports.updatetBalance = updateBalance;
module.exports.getBalance = getBalance;