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
const { formatDistance, formatRelative } = require("date-fns");
const { stripIndents } = require("common-tags");

module.exports = class OldestMemberCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "oldest-member",
      group: "fun",
      memberName: "oldest-member",
      description: "See who the oldest member on the server is.",
      aliases: ["oldest-user", "oldest"],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  exec(msg) {
    const oldest = msg.guild.members
      .sort((member1, member2) => {
        const timestamp1 = member1.user.createdTimestamp;
        const timestamp2 = member2.user.createdTimestamp;

        if (timestamp1 > timestamp2) {
          return 1;
        } else if (timestamp1 < timestamp2) {
          return -1;
        }
        return 0;
      })
      .first().user;

    const { createdAt } = oldest;
    const age = formatDistance(createdAt, new Date());
    const date = formatRelative(createdAt, new Date());
    return msg.reply(stripIndents`${oldest.tag} is the oldest member on this server.
    Their account is ${age} old (created ${date}).`);
  }
};
