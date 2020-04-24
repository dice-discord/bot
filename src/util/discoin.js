const config = require("../config");
const Discoin = require("@discoin/scambio").default;

const discoinClient = new Discoin(config.discoinToken, "___CURRENCY_THAT_DOESNT_EXIST___OAT");

module.exports = discoinClient;
