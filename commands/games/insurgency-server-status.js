// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', 'insurgency server status');
const srcdsHelper = require('../../util/srcdsHelper');
const gamedig = require('gamedig');

module.exports = class InsurgencyServerStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'insurgency-server-status',
      group: 'games',
      memberName: 'insurgency-server-status',
      description: 'Get information about a Insurgency server.',
      aliases: ['insurgency-server', 'insurgency-status', 'insurgency'],
      examples: ['insurgency-server-status 74.91.116.99', 'insurgency-server-status 162.254.194.139 27016'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [{
        key: 'host',
        prompt: 'What is the IP address or host you want to look up?',
        type: 'string'
      }, {
        'key': 'port',
        'prompt': 'What is the server\'s port?',
        'type': 'integer',
        'default': 27015,
        'max': 65535,
        'min': 1
      }]
    });
  }

  run(msg, { host, port }) {
    try {
      msg.channel.startTyping();
      const options = {
        host,
        type: 'insurgency'
      };

      if (port) {
        options.port = port;
      }

      gamedig.query(options)
        .then(data => msg.replyEmbed(srcdsHelper(data)
          .setThumbnail('https://steamcdn-a.akamaihd.net/steam/apps/222880/header.jpg')
          .addField('Friendly Fire', parseInt(data.raw.rules.mp_friendlyfire, 10) ? 'Yes' : 'No')))
        .catch(error => {
          if (error === 'UDP Watchdog Timeout') return msg.reply('Server timed out, it\'s probably offline.');

          logger.error(error);
          return msg.reply('An unknown error occured.');
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
