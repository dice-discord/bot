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

const SentryCommand = require("../../structures/SentryCommand");
const respond = require("../../util/simpleCommandResponse");

module.exports = class BanUserCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "ban-user",
      aliases: ["ban", "ban-member", "hackban-user", "hackban-member", "hackban"],
      group: "mod",
      memberName: "ban-user",
      description: "Ban any user from your server.",
      examples: ["ban @Zoop", "ban 213041121700478976", "ban Zoop Spamming messages"],
      clientPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"],
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 6
      },
      args: [
        {
          key: "user",
          prompt: "What user do you want to ban?",
          type: "user"
        },
        {
          key: "reason",
          prompt: "What is the reason for banning this user?",
          type: "string",
          label: "reason for ban",
          default: "",
          max: 400
        }
      ]
    });
  }

  async run(msg, { user, reason }) {
    if (reason) {
      reason = `${reason} - Requested by ${msg.author.tag}`;
    } else {
      reason = `Requested by ${msg.author.tag}`;
    }

    if ((await msg.guild.fetchBans()).has(user.id)) return msg.reply(`${user.tag} is already banned.`);

    msg.guild.members
      .ban(user.id, { reason })
      .then(() => {
        respond(msg);
        return null;
      })
      .catch(() => msg.reply("Unable to ban that user"));
    return null;
  }
};
