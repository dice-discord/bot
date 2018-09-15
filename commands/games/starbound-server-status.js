// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', 'starbound server status');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const gamedig = require('gamedig');

module.exports = class StarboundServerStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'starbound-server-status',
      group: 'games',
      memberName: 'starbound-server-status',
      description: 'Get information about a Starbound server.',
      aliases: ['starbound-server', 'starbound-server', 'starbound-status', 'starbound'],
      examples: ['starbound-server-status sb.ilovebacons.com', 'starbound-server-status 31.214.128.254 11600'],
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
        'default': 21025,
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
        type: 'starbound'
      };

      if (port) {
        options.port = port;
      }

      gamedig.query(options)
        .then(data => msg.replyEmbed(new MessageEmbed({
          title: data.name,
          thumbnail: { url: 'https://steamcdn-a.akamaihd.net/steam/apps/211820/header.jpg' },
          footer: { text: `Took ${moment.duration(data.query.duration).asSeconds().toFixed(2)} seconds to complete` },
          fields: [{
            name: 'IP Address',
            value: `${data.query.address} (port ${data.query.port})`
          }, {
            name: 'Online Players',
            value: `${data.raw.numplayers}/${data.maxplayers} (${Math.round((data.raw.numplayers / data.maxplayers) * 100)}%)`
          }, {
            name: 'Password Required',
            value: data.password ? 'Yes' : 'No'
          }]
        })))
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
