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
const { MessageEmbed } = require("discord.js");
const rp = require("request-promise-native");
const logger = require("../../util/logger").scope("command", "overwatch statistics");
const platforms = ["pc", "xbl", "psn"];
const regions = ["us", "eu", "asia"];

module.exports = class OverwatchStatisticsCommand extends Command {
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

  /* eslint-disable complexity */
  async run(msg, { battletag, platform, region }) {
    try {
      msg.channel.startTyping();

      const options = {
        uri: `https://ow-api.com/v1/stats/${platform}/${region}/${battletag}/profile`,
        json: true
      };
      const res = await rp(options).catch(err => {
        logger.error(err);
        return msg.reply("There was an error with the API we use (https://ow-api.com)");
      });

      /* eslint-disable max-len */
      if (res.error === "The requested player was not found") {
        return msg.reply("That user couldn't be found.");
      } else if (res.error) {
        logger.error(new Error(res.error));
        return msg.reply(
          `There was an error with the API we use (https://ow-api.com). The error that was sent: ${res.error}`
        );
      }

      logger.debug(`Result for ${battletag} on ${platform}: ${JSON.stringify(res)}`);

      const embed = new MessageEmbed({
        author: {
          name: res.name,
          url: "https://ow-api.com",
          iconURL: res.icon
        }
      });

      // Rating icon
      if (res.ratingIcon) {
        embed.setThumbnail(res.ratingIcon);
      }

      // Games won
      if (res.gamesWon && res.quickPlayStats.games.won && res.competitiveStats.games) {
        embed.addField(
          "🏆 Games Won",
          `${res.gamesWon} total wins (${res.quickPlayStats.games.won} from quick play and ${
            res.competitiveStats.games.won
          } from competitive)`
        );
      } else if (res.gamesWon && res.quickPlayStats.games.won) {
        embed.addField("🏆 Games Won", `${res.gamesWon} total wins`);
      }

      // Average eliminations
      if (res.quickPlayStats.eliminationsAvg && res.competitiveStats.eliminationsAvg) {
        embed.addField(
          "💀 Average Eliminations",
          `${res.quickPlayStats.eliminationsAvg} eliminations from quick play and ${
            res.competitiveStats.eliminationsAvg
          } from competitive`
        );
      } else if (res.quickPlayStats.eliminationsAvg) {
        embed.addField("💀 Average Eliminations", `${res.quickPlayStats.eliminationsAvg} eliminations from quick play`);
      }

      if (res.quickPlayStats) {
        // Games Played
        if (res.competitiveStats.games && res.quickPlayStats.games.played && res.competitiveStats.games.played) {
          embed.addField(
            "🎮 Games Played",
            `${res.quickPlayStats.games.played + res.competitiveStats.games.played} games played total (${
              res.quickPlayStats.games.played
            } from quick play and ${res.competitiveStats.games.played} from competitive)`
          );
        } else if (res.quickPlayStats.games.played) {
          embed.addField("🎮 Games Played", `${res.quickPlayStats.games.played} games played total`);
        }

        // Quick play medals
        if (res.quickPlayStats.awards.medals) {
          embed.addField(
            "🏅 Medals (Quick Play)",
            `${res.quickPlayStats.awards.medals} medals total.\n🥇 ${
              res.quickPlayStats.awards.medalsGold
            } gold medals\n🥈 ${res.quickPlayStats.awards.medalsSilver} silver medals\n🥉 ${
              res.quickPlayStats.awards.medalsBronze
            } bronze medals`
          );
        }
      }

      if (res.competitiveStats.awards) {
        // Competitive medals
        if (res.competitiveStats.awards.medals) {
          embed.addField(
            "🏅 Medals (Competitive)",
            `${res.competitiveStats.awards.medals} medals total.\n🥇 ${
              res.competitiveStats.awards.medalsGold
            } gold medals\n🥈 ${res.competitiveStats.awards.medalsSilver} silver medals\n🥉 ${
              res.competitiveStats.awards.medalsBronze
            } bronze medals`
          );
        }

        // Cards
        if (res.competitiveStats.awards.cards && res.quickPlayStats.awards.cards) {
          embed.addField(
            "🃏 Cards",
            `${res.competitiveStats.awards.cards + res.quickPlayStats.awards.cards} total cards (${
              res.quickPlayStats.awards.cards
            } from quick play, ${res.competitiveStats.awards.cards} from competitive)`,
            true
          );
          /* eslint-enable max-len complexity */
        }
      }
      return msg.replyEmbed(embed);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
