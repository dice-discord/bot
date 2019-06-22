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
const { MessageEmbed } = require("discord.js");
const axios = require("axios");
const logger = require("../../util/logger").scope("command", "overwatch statistics");
const platforms = ["pc", "xbl", "psn"];
const regions = ["us", "eu", "asia"];

module.exports = class OverwatchStatisticsCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "overwatch-statistics",
      group: "games",
      memberName: "overwatch-statistics",
      description: "Get statistics of an Overwatch player.",
      details: "Platforms are `pc` (PC), `xbl` (Xbox Live), and `psn` (PlayStation Network).",
      aliases: ["overwatch-stats", "overwatch", "ow-statistics", "ow-stats", "ow"],
      examples: ["overwatch-statistics cats#11481 pc us"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 4
      },
      args: [
        {
          key: "battletag",
          prompt: "What user do you want to look up?",
          type: "string",
          parse: battletag => battletag.replace(/[#]/, "-"),
          validate: value => {
            if (/.+[#]\d{4}/g.test(value)) return true;
            return false;
          }
        },
        {
          key: "platform",
          prompt: "What platform do you want to search on?",
          type: "string",
          parse: platform => platform.toLowerCase(),
          oneOf: platforms
        },
        {
          key: "region",
          prompt: "What region do you want to get statistics from?",
          type: "string",
          parse: region => region.toLowerCase(),
          oneOf: regions
        }
      ]
    });
  }

  async exec(msg, { battletag, platform, region }) {
    try {
      msg.channel.startTyping();

      const stats = (await axios(`https://ow-api.com/v1/stats/${platform}/${region}/${battletag}/profile`).catch(
        err => {
          logger.error(err);
          return msg.reply("There was an error with the API we use (https://ow-api.com)");
        }
      )).data;

      if (stats.error === "The requested player was not found") {
        return msg.reply("That user couldn't be found.");
      } else if (stats.error) {
        logger.error(new Error(stats.error));
        return msg.reply(
          `There was an error with the API we use (https://ow-api.com). The error that was sent: ${stats.error}`
        );
      }

      logger.debug(`Result for ${battletag} on ${platform}: ${JSON.stringify(stats)}`);

      const embed = new MessageEmbed({
        author: {
          name: stats.name,
          url: "https://ow-api.com",
          iconURL: stats.icon
        }
      });

      // Rating icon
      if (stats.ratingIcon) {
        embed.setThumbnail(stats.ratingIcon);
      }

      // Games won
      if (stats.gamesWon && stats.quickPlayStats.games.won && stats.competitiveStats.games) {
        embed.addField(
          "Games Won",
          `${stats.gamesWon} total wins (${stats.quickPlayStats.games.won} from quick play and ${stats.competitiveStats.games.won} from competitive)`
        );
      } else if (stats.gamesWon) {
        embed.addField("Games Won", `${stats.gamesWon} total wins`);
      }

      // Average eliminations
      if (stats.quickPlayStats && stats.quickPlayStats.eliminationsAvg && stats.competitiveStats.eliminationsAvg) {
        embed.addField(
          "Average Eliminations",
          `${stats.quickPlayStats.eliminationsAvg} eliminations from quick play and ${stats.competitiveStats.eliminationsAvg} from competitive`
        );
      } else if (stats.quickPlayStats && stats.quickPlayStats.eliminationsAvg) {
        embed.addField("Average Eliminations", `${stats.quickPlayStats.eliminationsAvg} eliminations from quick play`);
      }

      if (stats.quickPlayStats) {
        // Games Played
        if (stats.competitiveStats.games && stats.quickPlayStats.games.played && stats.competitiveStats.games.played) {
          embed.addField(
            "Games Played",
            `${stats.quickPlayStats.games.played + stats.competitiveStats.games.played} games played total (${
              stats.quickPlayStats.games.played
            } from quick play and ${stats.competitiveStats.games.played} from competitive)`
          );
        } else if (stats.quickPlayStats.games && stats.quickPlayStats.games.played) {
          embed.addField("Games Played", `${stats.quickPlayStats.games.played} games played total`);
        }

        // Quick play medals
        if (stats.quickPlayStats.awards && stats.quickPlayStats.awards.medals) {
          embed.addField(
            "Medals (Quick Play)",
            `${stats.quickPlayStats.awards.medals} medals total.\n${stats.quickPlayStats.awards.medalsGold} gold medals\n${stats.quickPlayStats.awards.medalsSilver} silver medals\n${stats.quickPlayStats.awards.medalsBronze} bronze medals`
          );
        }
      }

      if (stats.competitiveStats.awards) {
        // Competitive medals
        if (stats.competitiveStats.awards.medals) {
          embed.addField(
            "Medals (Competitive)",
            `${stats.competitiveStats.awards.medals} medals total.\n${stats.competitiveStats.awards.medalsGold} gold medals\n${stats.competitiveStats.awards.medalsSilver} silver medals\n${stats.competitiveStats.awards.medalsBronze} bronze medals`
          );
        }

        // Cards
        if (stats.competitiveStats.awards.cards && stats.quickPlayStats.awards.cards) {
          embed.addField(
            "Cards",
            `${stats.competitiveStats.awards.cards + stats.quickPlayStats.awards.cards} total cards (${
              stats.quickPlayStats.awards.cards
            } from quick play, ${stats.competitiveStats.awards.cards} from competitive)`,
            true
          );
        }
      }

      // Endorsement
      embed.addField("Endorsements", stats.endorsement.toLocaleString(), true);
      // Rating
      embed.addField("Rating", stats.rating.toLocaleString(), true);
      // Level
      embed.addField("Level", stats.level.toLocaleString(), true);

      return msg.replyEmbed(embed);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
