// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const config = require('../../config');
const database = require('../../providers/database');
const moment = require('moment');
const logger = require('../../providers/logger').scope('command', 'daily');
const DBL = require('dblapi.js');
const { oneLine } = require('common-tags');

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
      const oldTime = await database.getDailyUsed(msg.author.id);
      const currentTime = msg.createdTimestamp;
      const dbl = new DBL(config.botListTokens['discordbots.org']);
      const dblData = await Promise.all([
        dbl
          .hasVoted(msg.author.id)
          .catch(error => {
            logger.error('Error in discordbots.org vote checking', error.stack);
            return false;
          }),
        dbl.isWeekend()
      ]);

      // 23 hours because it's better for users to have some wiggle room
      const fullDay = 82800000;
      const waitDuration = moment.duration(oldTime - currentTime + fullDay).humanize();

      let payout = 1000;
      let note;

      logger.debug(`DBL vote status for ${msg.author.tag}: ${dblData[0]}${dblData[1] ? ' (weekend)' : ''}`);

      let multiplier = 1;

      if (dblData[0] && dblData[1]) {
        payout *= 4;
        multiplier *= 4;
        // eslint-disable-next-line max-len
        note = `You got ${multiplier}x your payout from voting for ${this.client.user} today and during the weekend. Use ${msg.anyUsage('vote')} to vote once per day.`;
      } else if (dblData[0]) {
        payout *= 2;
        multiplier *= 2;
        // eslint-disable-next-line max-len
        note = `You got double your payout from voting for ${this.client.user} today. Use ${msg.anyUsage('vote')} to vote once per day.`;
      } else {
        // eslint-disable-next-line max-len
        note = `You can double your payout from voting for ${this.client.user} each day and quadruple it for voting on the weekend. Use ${msg.anyUsage('vote')} to vote once per day.`;
      }

      if (config.patrons[msg.author.id] && config.patrons[msg.author.id].basic === true) {
        payout *= 2;
        multiplier *= 2;

        // eslint-disable-next-line max-len
        note = `You got ${multiplier}x your payout from voting for being a basic tier (or higher) patron.`;
      }

      // eslint-disable-next-line max-len
      logger.debug(`Old timestamp: ${new Date(oldTime)} (${oldTime})`);
      logger.debug(`Current timestamp: ${new Date(currentTime)} (${currentTime})`);

      if (oldTime + fullDay < currentTime || oldTime === false) {
        if (oldTime === false) {
          logger.note('Old timestamp was returned as false, meaning empty in the database.');
        }

        // Pay message author their daily and save the time their daily was used
        await Promise.all([
          database.balances.increase(msg.author.id, payout),
          database.setDailyUsed(msg.author.id, currentTime)
        ]);
        // Pay Dice the same amount to help handle the economy
        database.balances.increase(this.client.user.id, payout);

        // Daily not collected in one day
        const message = oneLine`You were paid ${payout.toLocaleString()} ${config.currency.plural}.
        Your balance is now ${(await database.balances.get(msg.author.id)).toLocaleString()} ${config.currency.plural}.`;
        return msg.reply(`${message}${note ? `\n${note}` : ''}`);
      }
      // Daily collected in a day or less (so, recently)
      // eslint-disable-next-line max-len
      return msg.reply(`🕓 You must wait ${waitDuration} before collecting your daily ${config.currency.plural}. Remember to vote each day and get double ${config.currency.plural}. Use ${msg.anyUsage('vote')}.`);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
