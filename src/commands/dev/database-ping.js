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

const SentryCommand = require("../../structures/SentryCommand");
const { oneLine } = require("common-tags");
const database = require("../../util/database");

module.exports = class DatabasePingCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "database-ping",
      group: "dev",
      memberName: "database-ping",
      description: "Checks the bot's ping to the Discord server and does a database request.",
      aliases: ["db-ping"],
      throttling: {
        usages: 2,
        duration: 20
      }
    });
  }

  async exec(msg) {
    if (msg.editable) {
      await msg.edit("Pinging...");
      await database.balances.get(msg.author.id);
      return msg.edit(oneLine`
				Pong! The message round-trip took ${msg.editedTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ""}
      `);
    } else {
      const pingMsg = await msg.reply("Pinging...");
      await database.balances.get(msg.author.id);
      return pingMsg.edit(oneLine`
				${msg.channel.type === "dm" ? "" : `${msg.author},`}
				Pong! The message round-trip took ${pingMsg.createdTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ""}
			`);
    }
  }
};
