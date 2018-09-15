// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const { Util } = require('discord.js');
const modes = ['encode', 'decode'];

/**
 * @param {string} text Text to encode or decode
 * @param {string} mode Mode for conversion
 * @returns {string} Converted text
*/
const convert = (text, mode) => {
  if (mode === 'encode') {
    return Buffer.from(text).toString('base64');
  } else if (mode === 'decode') {
    return Buffer.from(text, 'base64').toString('utf8');
  }
  return 'Unknown mode';
};

module.exports = class Base64Command extends Command {
  constructor(client) {
    super(client, {
      name: 'base64',
      aliases: ['base-64'],
      group: 'dev',
      memberName: 'base64',
      description: 'Converts text to and from Base64 encoding.',
      details: '**Modes**: `encode` or `decode`',
      args: [{
        key: 'mode',
        prompt: 'Do you want to `encode` or `decode`?',
        type: 'string',
        oneOf: modes,
        parse: mode => mode.toLowerCase()
      }, {
        key: 'text',
        prompt: 'What text do you want to convert to Base64?',
        type: 'string',
        parse: value => Util.escapeMarkdown(value)
      }]
    });
  }

  run(msg, { mode, text }) {
    return msg.reply(convert(text, mode), { split: true });
  }
};
