// made by nate lol (2018)
const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', 'insurgency server status');
const srcdsHelper = require('../../util/srcdsHelper');
const gamedig = require('gamedig');

module.exports = class RustServerStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rust-server-status',
      group: 'games',
      memberName: 'rust-server-status',
      aliases: ['rust-server', 'rust-status', 'rust'],
      description: 'Get information about a Rust Server',
      examples: ['rust-server-status 94.23.155.235', 'rust-server-status 151.80.111.180 28020'],
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
        default: 28015,
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
        type: 'rust'
      };

      if (port) {
        options.port = port;
      }

      gamedig.query(options)
        .then(data => msg.replyEmbed(srcdsHelper(data)
          .setThumbnail('hhttps://steamcdn-a.akamaihd.net/steam/apps/252490/header.jpg')))
          .addfield()
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
