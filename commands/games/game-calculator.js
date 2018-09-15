// Copyright 2018 Jonah Snider

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
