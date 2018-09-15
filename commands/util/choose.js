// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { Util } = require('discord.js');

module.exports = class ChooseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'choose',
      aliases: ['select', 'pick'],
      group: 'util',
      memberName: 'choose',
      description: 'Choose an item from a list you provide.',
      examples: ['choose red blue yellow green', 'choose "play PUBG" "play Fortnite" "delete System32"'],
      args: [{
        key: 'options',
        prompt: 'What do you want to select?',
        type: 'string',
        parse: value => Util.escapeMarkdown(value),
        infinite: true
      }],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { options }) {
    // Argument checking
    if (options.length < 2) return msg.reply('Please provide 2 or more options.');

    const randomNumber = Math.floor((Math.random() * (options.length - 0)) + 0);

    return msg.reply(`I choose #${randomNumber + 1}, ${options[randomNumber]}.`);
  }
};
