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

const KeenTracking = require("keen-tracking");
const config = require("../config");

const keenClient = new KeenTracking({
  projectId: config.keen.projectID,
  writeKey: config.keen.writeKey
});

module.exports = async (msg, reason) => {
  const { client } = msg;
  const database = require("../util/database");

  client.stats.increment("bot.commands.blocked");
  const userBalance = await database.balances.get(msg.author.id);

  const houseBalance = await database.balances.get(client.user.id);

  keenClient.recordEvent("blockedCommands", {
    author: msg.author,
    reason,
    timestamp: msg.createdAt,
    message: msg.content,
    userBalance,
    houseBalance
  });
};
