// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', 'garrys mod server status');
const srcdsHelper = require('../../util/srcdsHelper');
const gamedig = require('gamedig');

module.exports = class GarrysModServerStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'garrys-mod-server-status',
      group: 'games',
      memberName: 'garrys-mod-server-status',
      description: 'Get information about a Garry\'s Mod server.',
      aliases: ['gmod-server', 'garrys-mod-server', 'gmod-status', 'gmod'],
      examples: ['garrys-mod-server-status RP.SuperiorServers.co', 'garrys-mod-server-status 185.97.255.6 27016'],
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
        type: 'garrysmod'
      };

      if (port) {
        options.port = port;
      }

      gamedig.query(options)
        .then(data => msg.replyEmbed(srcdsHelper(data).setThumbnail('https://steamcdn-a.akamaihd.net/steam/apps/4000/header.jpg')))
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
