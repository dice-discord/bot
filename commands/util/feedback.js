// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', 'feedback');

module.exports = class FeedbackCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'feedback',
      aliases: ['bug-report', 'feed-back', 'suggest', 'suggestion'],
      group: 'util',
      memberName: 'feedback',
      description: 'Submit bugs and suggestions to the developer.',
      examples: ['feedback When I use `$$dice` the bot lags.'],
      args: [{
        key: 'userFeedback',
        label: 'feedback',
        prompt: 'What is your feedback you want to report?',
        type: 'string'
      }],
      throttling: {
        usages: 2,
        duration: 60
      }
    });
  }

  run(msg, { userFeedback }) {
    const message = '📝 Thanks for sending your feedback.';
    if (
      userFeedback.toLowerCase().includes('help')
   || userFeedback.toLowerCase().includes('support')
    ) {
      msg.reply(`${message} If you need help with a problem use ${msg.anyUsage('support')}.`);
    } else {
      msg.reply(message);
    }

    logger.debug('About to send MessageEmbed');

    // Pizza Fox#0075
    const developer = this.client.users.resolve('210024244766179329');

    return developer.send({
      embed: {
        author: {
          name: `${msg.author.tag} (${msg.author.id})`,
          // eslint-disable-next-line camelcase
          icon_url: msg.author.displayAvatarURL(128)
        },
        timestamp: new Date(msg.createdTimestamp),
        fields: [
          {
            name: 'Message',
            value: userFeedback
          }
        ]
      }
    });
  }
};
