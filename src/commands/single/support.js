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
const config = require("../../config");

module.exports = class SupportCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "support",
      group: "single",
      memberName: "support",
      description: `An invite to the <@${config.clientID}> server.`,
      aliases: ["home", "report", "bug"],
      throttling: {
        usages: 1,
        duration: 3
      }
    });
  }

  exec(msg) {
    msg.reply("👋 https://discord.gg/NpUmRkj");
  }
};
