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
const config = require('../../config');
const database = require('../../util/database');
const humanize = require('date-fns/distance_in_words_to_now');
const logger = require('../../util/logger').scope('command', 'daily');
const DBL = require('dblapi.js');
const { oneLine } = require('common-tags');
const ms = require('ms');

module.exports = class DailyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'daily',
      group: 'economy',
      memberName: 'daily',
      description: `Collect your daily ${config.currency.plural}.`,
      aliases: ['dailies'],
      throttling: {
        usages: 1,
        duration: 3
      }
    });
  }

  async run(msg) {
    try {
      msg.channel.startTyping();

      // Initialize variables
      const oldTimestamp = await database.getDailyUsed(msg.author.id);
      const currentTimestamp = msg.createdTimestamp;
      const dbl = new DBL(config.botListTokens['discordbots.org']);
      const dblData = await Promise.all([
        dbl
          .hasVoted(msg.author.id)
          .catch(error => {
            logger.error('Error in discordbots.org vote checking', error);
            return false;
          }),
        dbl.isWeekend()
      ]);

      // 23 hours because it's better for users to have some wiggle room
      const fullDay = ms('23 hours');
      const waitDuration = humanize(currentTimestamp + fullDay);

      let payout = 1000;
      let note;

      logger.debug(`DBL vote status for ${msg.author.tag}: ${dblData[0]}${dblData[1] ? ' (on the weekend)' : ''}`);

      let multiplier = 1;
      const vote = `Use ${msg.anyUsage('vote')} to vote once per day and get extra ${config.currency.plural}.`;
      const prompt = `your payout from voting for ${this.client.user}`;

      if (dblData[0] && dblData[1]) {
        payout *= 4;
        multiplier *= 4;
        note = `You got ${multiplier}x ${prompt} today and during the weekend. ${vote}`;
      } else if (dblData[0]) {
        payout *= 2;
        multiplier *= 2;
        note = `You got double ${prompt} today. ${vote}`;
      } else {
        note = oneLine`You can double ${prompt} each day and quadruple it for voting on the weekend.
        ${vote}`;
      }

      if (config.patrons[msg.author.id] && config.patrons[msg.author.id].basic === true) {
        payout *= 2;
        multiplier *= 2;

        note = `You got ${multiplier}x your payout from voting for being a basic tier (or higher) patron.`;
      }

      if (oldTimestamp) {
        logger.debug(`Old timestamp: ${new Date(oldTimestamp)} (${oldTimestamp})`);
      } else {
        logger.debug('No date in records (undefined)');
      }

      logger.debug(`Current timestamp: ${new Date(currentTimestamp)} (${currentTimestamp})`);

      if (!oldTimestamp || oldTimestamp + fullDay < currentTimestamp) {
        // Pay message author their daily and save the time their daily was used
        await Promise.all([
          database.balances.increase(msg.author.id, payout),
          database.setDailyUsed(msg.author.id, currentTimestamp)
        ]);
        // Pay Dice the same amount to help handle the economy
        database.balances.increase(this.client.user.id, payout);

        // Daily not collected in one day
        const bal = (await database.balances.get(msg.author.id)).toLocaleString();

        const message = oneLine`You were paid ${payout.toLocaleString()} ${config.currency.plural}.
        Your balance is now ${bal} ${config.currency.plural}.`;
        return msg.reply(`${message}${note ? `\n${note}` : ''}`);
      }
      // Daily collected in a day or less (so, recently)
      return msg.reply(`You must wait ${waitDuration} before collecting your daily ${config.currency.plural}. ${vote}`);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
