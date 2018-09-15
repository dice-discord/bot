// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', '7-days-to-die server status');
const { MessageEmbed, Util } = require('discord.js');
const moment = require('moment');
const gamedig = require('gamedig');

// Can't use numbers in class names
module.exports = class SevenDaysToDieServerStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: '7-days-to-die-server-status',
      group: 'games',
      memberName: '7-days-to-die-server-status',
      description: 'Get information about a 7 Days to Die server.',
      aliases: [
        '7-days-to-die-server',
        '7-days-to-die-status',
        '7-days-to-die',
        '7dtd-server',
        '7dtd-status',
        '7dtd'
      ],
      examples: ['7-days-to-die-server-status 7dtd.thehatedcrew.com', '7-days-to-die-server-status 206.217.135.18 41001'],
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
        'default': 26900,
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
        type: '7d2d'
      };

      if (port) {
        options.port = port;
      }

      gamedig.query(options)
        .then(data => {
          const embed = new MessageEmbed({
            title: data.name,
            thumbnail: { url: 'https://steamcdn-a.akamaihd.net/steam/apps/251570/header.jpg' },
            footer: { text: `Took ${moment.duration(data.query.duration).asSeconds().toFixed(2)} seconds to complete` },
            fields: [{
              name: 'Map',
              value: Util.escapeMarkdown(data.map)
            }, {
              name: 'IP Address',
              value: `${data.query.address} (port ${data.query.port})`
            }, {
              name: 'Online Players',
              value: `${data.raw.numplayers}/${data.maxplayers} (${Math.round((data.raw.numplayers / data.maxplayers) * 100)}%)`
            }, {
              name: 'Password Required',
              value: data.password ? 'Yes' : 'No'
            }]
          });

          if (data.raw.rules.ServerDescription) embed.setDescription(Util.escapeMarkdown(data.raw.rules.ServerDescription));

          return msg.replyEmbed(embed);
        })
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
