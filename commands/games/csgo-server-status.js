// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const srcdsHelper = require('../../util/srcdsHelper');
const logger = require('../../providers/logger').scope('command', 'csgo server status');
const gamedig = require('gamedig');

module.exports = class CSGOStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'csgo-server-status',
      group: 'games',
      memberName: 'csgo-server-status',
      description: 'Get information about a Counter-Strike Global Offensive server.',
      aliases: [
        'csgo-server',
        'counter-strike-server',
        'counter-strike-status',
        'counter-strike',
        'csgo-status',
        'csgo',
        'counter-strike-global-offensive',
        'counter-strike-global-offensive-server-status',
        'counter-strike-global-offensive-server',
        'counter-strike-global-offensive-status',
        'counter-strike-global-offensive'
      ],
      examples: ['csgo-server-status 74.91.123.188', 'csgo-server-status  Zombie.Mapeadores.com 27040'],
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
        key: 'port',
        prompt: 'What is the server\'s port?',
        type: 'integer',
        default: 27015,
        max: 65535,
        min: 1
      }]
    });
  }

  run(msg, { host, port }) {
    try {
      msg.channel.startTyping();
      const options = {
        host,
        type: 'csgo'
      };

      if (port) {
        options.port = port;
      }

      gamedig.query(options)
        .then(data => msg.replyEmbed(srcdsHelper(data).setThumbnail('https://steamcdn-a.akamaihd.net/steam/apps/730/header.jpg')))
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
