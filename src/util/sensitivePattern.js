/*
Copyright 2019 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { escapeRegex } = require("discord.js-commando").util;
const config = require("../config");

const sensitiveTerms = [];

if (config.discordToken) sensitiveTerms.push(config.discordToken);
if (config.fortniteTrackerNetworkToken) sensitiveTerms.push(config.fortniteTrackerNetworkToken);
if (config.discoinToken) sensitiveTerms.push(config.discoinToken);
if (config.backend) sensitiveTerms.push(config.backend);
if (config.mongoDBURI) sensitiveTerms.push(config.mongoDBURI);
if (config.keen && config.keen.writeKey) sensitiveTerms.push(config.keen.writeKey);
if (config.sentryDSN) sensitiveTerms.push(config.sentryDSN);
if (config.webhooks) {
  if (config.webhooks.discoin) sensitiveTerms.push(config.webhooks.discoin);
  if (config.webhooks.updates) sensitiveTerms.push(config.webhooks.updates);
}
if (process.env.SQREEN_TOKEN) sensitiveTerms.push(process.env.SQREEN_TOKEN);
if (config.botListTokens) {
  for (const key in config.botListTokens) {
    if (config.botListTokens.hasOwnProperty(key) && typeof config.botListTokens[key] !== "undefined") {
      sensitiveTerms.push(config.botListTokens[key]);
    }
  }
}

const escaped = sensitiveTerms.map(val => escapeRegex(val));
const pattern = escaped.join("|");

module.exports = { sensitivePattern: new RegExp(pattern, "gi"), sensitiveTerms };
