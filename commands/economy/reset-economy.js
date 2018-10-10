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
const logger = require('../../providers/logger').scope('command', 'reset economy');
const database = require('../../providers/database');
const { stripIndents } = require('common-tags');

module.exports = class ResetEconomyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reset-economy',
      group: 'economy',
      memberName: 'reset-economy',
      description: 'Reset the entire economy.',
      details: 'Only the bot owner(s) may use this command.',
      aliases: ['destroy-eco', 'destroy-economy', 'economy-destroy', 'eco-destroy', 'reset-eco'],
      throttling: {
        usages: 2,
        duration: 30
      },
      ownerOnly: true
    });
  }

  run(msg) {
    const randomNumber = parseInt((Math.random() * (100 - 10)) + 10, 10);
    msg.reply(stripIndents`⚠ **Are you absolutely sure you want to destroy all user profiles?** ⚠\n
    To proceed, enter \`${randomNumber}\`.\n
    The command will automatically be cancelled in 30 seconds.`)
      .then(() => {
        const filter = message => msg.author.id === message.author.id;

        msg.channel.awaitMessages(filter, { time: 30000, maxMatches: 1, errors: ['time'] })
          .then(messages => {
            if (messages.first().content.includes(randomNumber)) {
              logger.critical(`Verification passed (collected message: ${messages.first().content}, wiping database.`);
              // Start resetting the economy
              msg.reply('💣 Resetting the economy.');
              database.resetEconomy().then(() =>
                // Once the promise is fulfilled (when it's finished) respond to the user that it's done
                msg.reply('💥 Finished resetting the economy.'));
            }
          })
          .catch(() => msg.reply('Cancelled command.'));
      });
  }
};
