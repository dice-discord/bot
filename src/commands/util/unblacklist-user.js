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

const logger = require("../../util/logger").scope("command", "unblacklist user");
const SentryCommand = require("../../structures/SentryCommand");
const respond = require("../../util/simpleCommandResponse");

module.exports = class UnblacklistUserCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "unblacklist-user",
      aliases: ["unblacklist", "remove-blacklist-user", "remove-blacklist"],
      group: "util",
      memberName: "unblacklist-user",
      description: "Remove a user from the blacklist.",
      throttling: {
        usages: 2,
        duration: 3
      },
      ownerOnly: true,
      args: [
        {
          key: "user",
          prompt: "Who do you want to remove from the blacklist?",
          type: "user"
        }
      ]
    });
  }

  async run(msg, { user }) {
    // Get all blacklisted users
    const blacklist = await this.client.provider.get("global", "blacklist", []);

    // Check if the user is actually blacklisted
    if (!blacklist.includes(user.id)) return msg.reply("That user isn't blacklisted.");

    // Find the user in the array and delete it
    logger.debug(`Blacklist item index: ${blacklist.indexOf(user.id)}`);
    blacklist.splice(blacklist.indexOf(user.id));

    // Set the array to our updated version
    await this.client.provider.set("global", "blacklist", blacklist);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
