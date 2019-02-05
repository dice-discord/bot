const { escapeRegex } = require("discord.js-commando").util;
const config = require("../config");

const sensitiveTerms = [];

if (config.discordToken) sensitiveTerms.push(config.discordToken);
if (config.fortniteTrackerNetworkToken) sensitiveTerms.push(config.fortniteTrackerNetworkToken);
if (config.discoinToken) sensitiveTerms.push(config.discoinToken);
if (config.backend) sensitiveTerms.push(config.backend);
if (config.mongoDBURI) sensitiveTerms.push(config.mongoDBURI);
if (config.keen.writeKey) sensitiveTerms.push(config.keen.writeKey);
if (config.sentryDSN) sensitiveTerms.push(config.sentryDSN);
if (config.webhooks.discoin) sensitiveTerms.push(config.webhooks.discoin);
if (config.webhooks.updates) sensitiveTerms.push(config.webhooks.updates);
for (const key in config.botListTokens) {
  if (config.botListTokens.hasOwnProperty(key)) {
    if (typeof config.botListTokens[key] !== "undefined") sensitiveTerms.push(config.botListTokens[key]);
  }
}

const escaped = sensitiveTerms.map(val => escapeRegex(val));
const pattern = escaped.join("|");

module.exports = new RegExp(pattern, "gi");
