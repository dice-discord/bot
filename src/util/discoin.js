const config = require("../config");
const Discoin = require("@discoin/scambio").default;

const discoinClient = new Discoin(config.discoinToken, "OAT");

module.exports = discoinClient;
