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

module.exports = class InviteCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "invite",
      group: "single",
      memberName: "invite",
      description: `An invite link for <@${config.clientID}>.`,
      throttling: {
        usages: 1,
        duration: 3
      }
    });
  }

  exec(msg) {
    return msg.reply(`👋 ${config.invites.bot}`);
  }
};
