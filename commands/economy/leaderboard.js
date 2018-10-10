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

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const database = require('../../providers/database');
const config = require('../../config');
const logger = require('../../providers/logger').scope('command', 'leaderboard');

module.exports = class LeaderboardCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      group: 'economy',
      memberName: 'leaderboard',
      description: `Shows a top ten leaderboard of who has the most ${config.currency.plural}.`,
      aliases: ['top-10', 'top-ten', 'chart', 'top'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  async run(msg) {
    try {
      msg.channel.startTyping();

      const leaderboardArray = await database.leaderboard();

      logger.debug('Contents of leaderboard array:', JSON.stringify(leaderboardArray));
      logger.debug('Leaderboard array length:', leaderboardArray.length);

      // Check if there are enough users to populate the embed
      if (leaderboardArray.length < 10) {
        return msg.reply('There are less than 10 users total.');
      }

      const userTagFromID = async arrayPlace => (await this.client.users.fetch(leaderboardArray[arrayPlace].id)).tag;

      const users = [];
      leaderboardArray.forEach(user => users.push(user));

      const promises = [];
      users.forEach(user => promises.push(userTagFromID(leaderboardArray.indexOf(user))));
      const tags = await Promise.all(promises);

      const embed = new MessageEmbed({ title: 'Top 10 Leaderboard' });

      for (let i = 0; i < leaderboardArray.length; i++) {
        // eslint-disable-next-line max-len
        embed.addField(`#${i + 1} ${tags[i]}`, `${leaderboardArray[i].balance.toLocaleString()} ${config.currency.plural}`);
      }

      return msg.replyEmbed(embed);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
