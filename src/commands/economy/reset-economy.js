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
const logger = require("../../util/logger").scope("command", "reset economy");
const database = require("../../util/database");

module.exports = class ResetEconomyCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "reset-economy",
      group: "economy",
      memberName: "reset-economy",
      description: "Reset the entire economy.",
      details: "Only the bot owner(s) may use this command.",
      aliases: ["destroy-eco", "destroy-economy", "economy-destroy", "eco-destroy", "reset-eco"],
      args: [
        {
          key: "verification",
          prompt: "⚠ **Are you absolutely sure you want to destroy all user profiles?** ⚠",
          type: "boolean",
          default: false
        }
      ],
      ownerOnly: true
    });
  }

  async exec(msg, { verification }) {
    if (verification) {
      await database.resetEconomy();

      logger.critical("Reset the economy");

      return msg.reply("💥 Finished resetting the economy.");
    } else {
      return msg.reply("Cancelled command (missing verification).");
    }
  }
};
