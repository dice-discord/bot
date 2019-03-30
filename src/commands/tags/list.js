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

module.exports = class ListTagsCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "list-tags",
      aliases: ["tags-list", "list-tag", "tag-list"],
      group: "tags",
      memberName: "list",
      description: "List all tags from a server's tags.",
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  async exec(msg) {
    // Get all tags
    const tags = await this.client.provider.get(msg.guild, "tags", {});
    return msg.reply(
      Object.keys(tags).length > 0 ? `\`${Object.keys(tags).join("`, `")}\`` : "No tags on this server.",
      { split: true }
    );
  }
};
