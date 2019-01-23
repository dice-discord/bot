/*
Copyright 2018 Jonah Snider

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

const { Command } = require("discord.js-commando");
const database = require("../../util/database");
const config = require("../../config");

module.exports = class StatisticsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "statistics",
      group: "util",
      memberName: "statistics",
      description: `Get statistics on <@${config.clientID}>.`,
      aliases: ["stats"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 2,
        duration: 20
      }
    });
  }

  async run(msg) {
    try {
      msg.channel.startTyping();

      const serverCount = await this.client.shard.broadcastEval(
        "this.guilds.size"
      );

      return msg.replyEmbed({
        title: "Dice Statistics",
        fields: [
          {
            name: "👤 Total Number of Users",
            // Subtract one because of the Dice bot and for the Dice Dev bot
            value: `${(
              (await database.userCount()) - 2
            ).toLocaleString()} users`
          },
          {
            name: "👥 Total Number of Servers",
            value: `${serverCount
              .reduce((prev, val) => prev + val, 0)
              .toLocaleString()} servers`
          }
        ]
      });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
