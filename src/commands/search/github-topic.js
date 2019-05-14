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
const axios = require("axios");
const logger = require("../../util/logger").scope("command", "bible");
const truncateText = require("../../util/truncateText");

module.exports = class GitHubTopicCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "github-topic-search",
      group: "search",
      memberName: "github-topic",
      description: "Look up a topic from GitHub",
      examples: ["github-topic-search discord.js"],
      clientPermissions: ["EMBED_LINKS"],
      aliases: ["github-topic", "gh-topic-search", "gh-topic"],
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: "topic",
          prompt: "What topic do you want to look up?",
          type: "string"
        }
      ]
    });
  }

  exec(msg, { topic }) {
    try {
      msg.channel.startTyping();

      axios
        .get("https://api.github.com/search/topics", {
          headers: { Accept: "application/vnd.github.mercy-preview+json" },
          params: {
            q: topic
          }
        })
        .then(response => {
          const { items } = response.data;
          const [data] = items;

          if (items.length === 0) {
            return msg.reply("No results found.");
          }

          return msg.replyEmbed({
            title: data.display_name,
            author: {
              name: data.created_by
            },
            url: `https://github.com/topics/${topic}`,
            description: truncateText(data.description),
            footer: {
              text: "GitHub",
              iconURL: "https://i.imgur.com/TgqZlMD.png",
              url: "https://github.com"
            }
          });
        })
        .catch(error => {
          logger.error(error);

          return msg.reply("There was an error with GitHub.");
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
