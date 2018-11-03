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
const simpleFormat = require('../../util/simpleFormat');
const database = require('../../util/database');
const respond = require('../../util/simpleCommandResponse');

module.exports = class RemoveBalanceCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-balance',
      group: 'economy',
      memberName: 'remove-balance',
      description: 'Remove oats from another user\'s account.',
      details: 'Only the bot owner(s) may use this command.',
      aliases: ['remove-bal', 'decrease-balance', 'decrease-bal', 'lower-bal', 'reduce-bal'],
      examples: ['remove-balance 500 @Dice'],
      args: [{
        key: 'amount',
        prompt: 'How many oats do you want to remove?',
        type: 'float',
        parse: amount => simpleFormat(amount),
        min: config.minCurrency
      },
      {
        key: 'user',
        prompt: 'Who do you want to remove oats from?',
        type: 'user'
      }],
      throttling: {
        usages: 2,
        duration: 30
      },
      ownerOnly: true
    });
  }

  async run(msg, { user, amount }) {
    // Permission checking
    if (user.bot === true && user.id !== this.client.user.id) {
      return msg.reply('You can\'t remove oats from bots.');
    }

    // Remove oats from user
    await database.balances.decrease(user.id, amount);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
