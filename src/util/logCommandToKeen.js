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

const config = require("../config");

module.exports = async (msg, args) => {
  if (config.keen.projectID && config.keen.writeKey) {
    const cmd = msg.command;

    const { client } = msg;
    const database = require("../util/database");

    const userBalance = await database.balances.get(msg.author.id, false);
    const houseBalance = await database.balances.get(client.user.id, false);

    return client.keen.recordEvent("commands", {
      author: {
        id: msg.author.id,
        tag: msg.author.tag
      },
      timestamp: msg.createdAt,
      message: msg.content,
      args,
      command: { group: { name: cmd.group.name }, name: cmd.name },

      userBalance,
      houseBalance
    });
  }
};
