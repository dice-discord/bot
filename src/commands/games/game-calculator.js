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

const config = require('../../config');
const winPercentage = require('../../util/winPercentage');
const simpleFormat = require('../../util/simpleFormat');
const { Command } = require('discord.js-commando');

module.exports = class GameCalculatorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'game-calculator',
      group: 'games',
      memberName: 'game-calculator',
      description: 'Calculate the odds of winning a round of the betting game.',
      aliases: [
        'game-calc',
        'game-chance',
        'win-chance',
        'win-percentage',
        'game-percentage',
        'game-percent',
        'win-percent',
        'win-calc'
      ],
      examples: ['game-calculator 4', 'game-calculator 1.02'],
      args: [
        {
          key: 'multiplier',
          prompt: 'What multiplier do you want to check?',
          type: 'float',
          // Round multiplier to second decimal place
          parse: value => simpleFormat(value),
          min: config.minMultiplier,
          max: config.maxMultiplier
        }
      ],
      throttling: {
        usages: 2,
        duration: 5
      }
    });
  }

  run(msg, { multiplier }) {
    return msg.reply(`🔢 Win Percentage: \`${simpleFormat(winPercentage(multiplier, msg.author))}%\`.`);
  }
};
