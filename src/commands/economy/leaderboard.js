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
const database = require("../../util/database");
const config = require("../../config");
const logger = require("../../util/logger").scope("command", "leaderboard");
const ms = require("ms");
const { stripIndents } = require("common-tags");

module.exports = class LeaderboardCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      group: "economy",
      memberName: "leaderboard",
      description: `Shows a top ten leaderboard of who has the most ${config.currency.plural}.`,
      details: `When you collect dailies or lose a game against the bot, it will keep your ${config.currency.plural}. Try to gain enough to beat it!`,
      aliases: ["top-10", "top-ten", "chart", "top"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: "limit",
          prompt: "How many users do you want to limit your results for?",
          type: "integer",
          default: 10,
          min: 1,
          max: 50
        }
      ]
    });
  }

  async exec(msg, { limit }) {
    try {
      msg.channel.startTyping();

      const start = new Date().getTime();
      const leaderboardArray = await database.leaderboard(limit);

      logger.debug("Contents of leaderboard array:", JSON.stringify(leaderboardArray));
      logger.debug("Leaderboard array length:", leaderboardArray.length);

      const userTagFromID = arrayPlace => {
        const keyvString = leaderboardArray[arrayPlace].key;
        let id;
        const regex = /keyv:(\d+)/g;
        let m;

        while ((m = regex.exec(keyvString)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }

          // The result can be accessed through the `m`-variable.
          m.forEach((match, groupIndex) => {
            if (groupIndex === 1) {
              id = match;
            }
          });
        }

        return this.client.users.fetch(id).then(user => user.tag);
      };

      const users = [];
      leaderboardArray.forEach(user => users.push(user));

      const promises = [];
      users.forEach(user => promises.push(userTagFromID(leaderboardArray.indexOf(user))));
      const tags = await Promise.all(promises);

      const embed = new MessageEmbed({ title: `Top ${limit} Leaderboard` });

      if (limit <= 10) {
        // Use an embed if there are 10 or less items
        for (let i = 0; i < leaderboardArray.length; i++) {
          embed.addField(
            `#${i + 1} ${tags[i]}`,
            `${leaderboardArray[i].value.value.toLocaleString()} ${config.currency.plural}`
          );
        }
      } else {
        // Use a code block if there are more than 10 items
        embed.setDescription(stripIndents`
        \`\`\`markdown
        ${leaderboardArray
          .map((doc, index) => {
            const balance = doc.value.value.toLocaleString();
            const userTag = tags[index];
            // The 2 here is the length of the string ". "
            const paddedNumber = `${index + 1}. `.padEnd(limit.toString().length + 2);
            return `${paddedNumber}${userTag} - ${balance} ${config.currency.plural}`;
          })
          .join("\n")}
        \`\`\`
        `);
      }

      const end = new Date().getTime();
      embed.setFooter(`Took ${ms(end - start)}`);
      return msg.replyEmbed(embed);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
