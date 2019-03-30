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
const logger = require("../../util/logger").scope("command", "guild backdoor");

module.exports = class GuildBackdoorCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "guild-backdoor",
      aliases: ["backdoor", "server-backdoor"],
      group: "util",
      memberName: "guild-backdoor",
      description: "Get an invite to a server.",
      throttling: {
        usages: 2,
        duration: 3
      },
      ownerOnly: true,
      args: [
        {
          key: "guild",
          prompt: "What server do you want to get a backdoor to?",
          type: "string"
        }
      ]
    });
  }

  async exec(msg, { guild }) {
    if (!this.client.guilds.has(guild)) return msg.reply(`Not a guild ID or a guild ${this.client.user} is on.`);

    guild = this.client.guilds.get(guild);

    const invites = await guild.fetchInvites();
    logger.debug("This guild's invites:", invites);
    if (invites.size > 0) {
      return msg.reply(invites.first().url);
    }

    for (const channel of guild.channels.values()) {
      if (channel.permissionsFor(guild.me).has("CREATE_INSTANT_INVITE")) {
        // eslint-disable-next-line no-await-in-loop
        return msg.reply((await channel.createInvite({ maxAge: 0 })).url);
      }
    }

    return msg.reply("No existing invites or channels to invite you to.");
  }
};
