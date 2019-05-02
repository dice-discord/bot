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
const { MessageEmbed, Util } = require("discord.js");
const axios = require("axios");
const logger = require("../../util/logger").scope("command", "npm-search");
const truncateText = require("../../util/truncateText");

module.exports = class NPMSearchCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "npm-search",
      group: "search",
      memberName: "npm",
      description: "Get information about an NPM package",
      examples: ["npm-search ms", "npm-search commando-provider-keyv"],
      clientPermissions: ["EMBED_LINKS"],
      aliases: ["npm"],
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: "pkg",
          prompt: "What package do you want to get information for?",
          type: "string",
          label: "package name"
        },
        {
          key: "full",
          prompt: "Do you want to show the full results?",
          type: "boolean",
          label: "show full results",
          default: false
        }
      ]
    });
  }

  async exec(msg, { pkg, full }) {
    try {
      const { data } = await axios.get(`https://registry.npmjs.com/${encodeURIComponent(pkg)}`);

      const embed = new MessageEmbed({
        title: truncateText(data.name, 256),
        color: 0xca3b3a,
        url: data.homepage || `https://www.npmjs.com/package/${pkg}`,
        footer: {
          text: "NPM",
          iconURL: "https://avatars0.githubusercontent.com/u/6078720"
        }
      });

      let { description } = data;
      const version = data.versions[data["dist-tags"].latest];
      const dependencies = version.dependencies ? Object.keys(version.dependencies).join(", ") : null;

      if (full) description = data.readme;
      if (description) embed.setDescription(truncateText(description));
      if (data["dist-tags"].latest) embed.addField("Latest Release", `v${data["dist-tags"].latest}`);
      if (dependencies) embed.addField("Dependencies", this.clean(dependencies, 1024));
      if (data.keywords) embed.addField("Keywords", this.clean(data.keywords.join(", "), 1024));
      if (data.author && data.author.name) embed.setAuthor(truncateText(data.author.name, 256));

      return msg.replyEmbed(embed);
    } catch (err) {
      if (err.status === 404) {
        return msg.reply("That package couldn't be found.");
      }
      logger.error(err);
      return msg.reply("There was an error with NPM)");
    }
  }

  clean(string, max = 2048) {
    return truncateText(Util.escapeMarkdown(string), max);
  }
};
