const rules = require("./rules");
const pathToJSON = `../../balances/${id}`;

module.exports = function updateBalance(id, newBalance) {
    // Load our target user file
    

    // Convert our data into JSON readable format
    var balanceJSON = {
        balance: newBalance
    };
    var profile = JSON.stringify(balanceJSON);

    // Write the balance to a file
    fs.writeFile(pathToJSON, profile);
};

module.exports = function getBalance(id) {
    // Load our target user file
    if (!fs.existsSync(`../../balances/${id}`)) {
        // File doesn't exist, so make one
        updateBalance(id, rules["newUserBalance"]);
    }

    balanceJSON = require(pathToJSON);
    return balanceJSON["balance"];
};