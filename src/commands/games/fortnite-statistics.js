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
const rp = require("request-promise-native");
const logger = require("../../util/logger").scope("command", "fortnite statistics");
const config = require("../../config");
const { MessageEmbed } = require("discord.js");
const platforms = ["pc", "xbl", "psn"];

module.exports = class FortniteStatisticsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "fortnite-statistics",
      group: "games",
      memberName: "fortnite-statistics",
      description: "Get statistics of a Fortnite player.",
      details: "Platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).",
      aliases: ["fortnite-stats", "fortnite"],
      examples: ["fortnite-statistics pc Zaccubus", 'fortnite-stats pc "WBG Strafesh0t"'],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: "platform",
          prompt: "What platform do you want to search on?",
          type: "string",
          parse: platform => platform.toLowerCase(),
          oneOf: platforms
        },
        {
          key: "username",
          prompt: "What user do you want to look up?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, { platform, username }) {
    try {
      msg.channel.startTyping();

      const options = {
        uri: `https://api.fortnitetracker.com/v1/profile/${platform}/${username}`,
        json: true,
        headers: { "TRN-Api-Key": config.fortniteTrackerNetworkToken }
      };

      const stats = await rp(options).catch(error => {
        logger.error(error);
        return msg.reply("There was an error with the API we use (https://api.fortnitetracker.com)");
      });

      if (stats.error === "Player Not Found") {
        return msg.reply("Player not found on that platform.");
      }

      logger.debug(`Result for ${username} on ${platform}:`, JSON.stringify(stats));
      const embed = new MessageEmbed({
        title: stats.epicUserHandle,
        url: `https://fortnitetracker.com/profile/${platform}/${encodeURIComponent(username)}`,
        footer: { text: "Information provided by the Tracker Network" }
      });

      if (stats.lifeTimeStats[8] && stats.lifeTimeStats[9]) {
        embed.addField("🏆 Wins", `${stats.lifeTimeStats[8].value} wins (${stats.lifeTimeStats[9].value})`);
      }

      if (stats.lifeTimeStats[10] && stats.lifeTimeStats[11]) {
        embed.addField(
          "💀 Kills",
          `${stats.lifeTimeStats[10].value} kills. ${stats.lifeTimeStats[11].value} K/D ratio.`
        );
      }

      if (stats.lifeTimeStats[7]) {
        embed.addField("🎮 Matches Played", stats.lifeTimeStats[7].value.toString());
      }

      if (stats.lifeTimeStats[6]) {
        embed.addField("🔢 Score", stats.lifeTimeStats[6].value.toString());
      }

      return msg.replyEmbed(embed);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
