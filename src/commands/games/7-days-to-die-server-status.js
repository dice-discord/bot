/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { Command } = require('discord.js-commando');
const logger = require('../../util/logger').scope('command', '7-days-to-die server status');
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
        '7dtd',
        '7days'
      ],
      examples: [
        '7-days-to-die-server-status 7dtd.thehatedcrew.com',
        '7-days-to-die-server-status 206.217.135.18 41001'
      ],
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
        default: 26900,
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
        type: '7d2d'
      };

      if (port) {
        options.port = port;
      }

      gamedig.query(options)
        .then(data => {
          const cur = data.raw.numplayers;
          const max = data.maxplayers;

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
              value: `${cur}/${max} (${Math.round((cur / max) * 100)}%)`
            }, {
              name: 'Password Required',
              value: data.password ? 'Yes' : 'No'
            }]
          });

          if (data.raw.rules.ServerDescription) {
            const clean = Util.escapeMarkdown(data.raw.rules.ServerDescription);
            embed.setDescription(clean);
          }

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
