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
const database = require("../../util/database");
const respond = require("../../util/simpleCommandResponse");

module.exports = class ResetDailyCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "reset-daily",
      group: "economy",
      memberName: "reset-daily",
      description: "Reset a user's last claimed daily timestamp.",
      details: "Only the bot owner(s) may use this command.",
      aliases: ["reset-dailies", "daily-reset", "dailies-reset"],
      examples: ["reset-daily @Dice"],
      args: [
        {
          key: "user",
          prompt: "Who's wait time do you want to reset?",
          type: "user",
          default: ""
        }
      ],
      throttling: {
        usages: 2,
        duration: 30
      },
      ownerOnly: true
    });
  }

  async exec(msg, { user }) {
    user = user || msg.author;

    // Permission checking
    if (user.bot === true) {
      return msg.reply("You can't reset a bot's daily wait time.");
    }

    await database.setDailyUsed(user.id, false);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
