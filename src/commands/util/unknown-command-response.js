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

module.exports = class UnknownCommandResponseCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "unknown-command-response",
      group: "util",
      memberName: "unknown-command-response",
      description: "Enable or disable unknown command responses.",
      details: "If no setting is provided, the current setting will be shown.",
      examples: ["unknown-command-response on"],
      aliases: [
        "unknown-response",
        "unknown-cmd-response",
        "unknown-command-respond",
        "unknown-respond",
        "unknown-cmd-respond",
        "set-unknown-command-response",
        "set-unknown-response",
        "set-unknown-cmd-response",
        "set-unknown-command-respond",
        "set-unknown-respond",
        "set-unknown-cmd-respond"
      ],
      args: [
        {
          key: "updated",
          label: "setting",
          prompt: "Do you want to enable the unknown command response?",
          type: "boolean",
          default: ""
        }
      ]
    });
  }

  async exec(msg, { updated }) {
    const old = await this.client.provider.get(msg.guild, "unknownCommandResponse", false);

    if (typeof updated === "boolean") {
      await this.client.provider.set(msg.guild, "unknownCommandResponse", updated);

      return msg.reply(`Set the unknown command response setting to ${updated ? "" : "not"} respond`);
    } else {
      return msg.reply(`Current setting is to ${old ? "" : "not "}respond.`);
    }
  }
};
