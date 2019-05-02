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

module.exports = class UnknownCommandCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "unknown-command",
      group: "util",
      memberName: "unknown-command",
      description: "Displays help information for when an unknown command is used.",
      examples: ["unknown-command kick-everybody-ever"],
      unknown: true,
      hidden: true,
      argsType: "single"
    });
  }

  async exec(msg, args) {
    if (msg.guild) {
      const tags = await this.client.provider.get(msg.guild, "tags");

      if (
        msg.content.split(msg.guild.commandPrefix)[1] !== "undefined" &&
        typeof tags !== "undefined" &&
        tags.hasOwnProperty(args.toLowerCase())
      ) {
        this.client.registry.resolveCommand("tags:get").exec(msg, { name: args });
        return null;
      }
    }

    const unknownCommandResponse = await this.client.provider.get(msg.guild, "unknownCommandResponse", false);
    if (unknownCommandResponse) {
      return msg.reply(
        `Unknown command. Use ${msg.anyUsage(
          "help",
          msg.guild ? undefined : null,
          msg.guild ? undefined : null
        )} to view the command list.`
      );
    }

    return null;
  }
};
