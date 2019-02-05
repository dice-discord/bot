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

const { Command } = require("discord.js-commando");

module.exports = class BulkDeleteMessagesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "bulk-delete-messages",
      aliases: [
        "prune",
        "message-prune",
        "message-bulk-delete",
        "delete-messages",
        "messages-prune",
        "messages-bulk-delete",
        "bulk-delete"
      ],
      group: "mod",
      memberName: "bulk-delete-messages",
      description: "Bulk delete messages in a text channel.",
      examples: ["bulk-delete-messages 20"],
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"],
      guildOnly: true,
      args: [
        {
          key: "messageCount",
          prompt: "How many messages do you want to delete?",
          type: "integer",
          min: 1,
          max: 100,
          label: "message count"
        }
      ],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  async run(msg, { messageCount }) {
    try {
      msg.channel.startTyping();

      await msg.delete();
      const messagesToDelete = await msg.channel.messages.fetch({
        limit: messageCount
      });
      msg.channel
        .bulkDelete(messagesToDelete, true)
        .then(messages => msg.reply(`🗑 \`${messages.size}\` messages deleted.`));
    } finally {
      msg.channel.stopTyping();
    }
  }
};
