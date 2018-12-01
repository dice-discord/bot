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

const { formatDistance, subMilliseconds } = require('date-fns');
const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');
const config = require('../../config');
const packageData = require('../../../package');

module.exports = class BotInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bot-info',
      group: 'util',
      memberName: 'bot-info',
      description: `Information about <@${config.clientID}>.`,
      aliases: [
        'uptime',
        'version',
        'bot',
        'memory',
        'ram',
        'memory-usage',
        'ram-usage',
        'patrons',
        'supporters'
      ],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 3,
        duration: 8
      }
    });
  }

  run(msg) {
    try {
      msg.channel.startTyping();
      return msg.replyEmbed({
        title: this.client.username,
        url: 'https://dice.js.org',
        color: 0x4caf50,
        description: oneLine`${this.client.user} is made by PizzaFox#0075.
        It was first a game bot based off the game [bustadice](https://bustadice.com).
        Later, more features were created and added, one by one creating the ${this.client.user} we have today.
        In March 2018 Dice was accepted into the [Discoin](https://dice.js.org/discoin) network.
        Discoin is a system allowing for participating bots to convert currencies.`,
        thumbnail: { url: this.client.user.displayAvatarURL({ format: 'webp' }) },
        fields: [{
          name: '🕒 Uptime',
          value: formatDistance(subMilliseconds(new Date(), this.client.uptime), new Date()),
          inline: true
        }, {
          name: '🎲 Dice version',
          value: `v${packageData.version}`,
          inline: true
        }, {
          name: '🤠 Support team',
          value: 'PizzaFox#0075, okthx#1013, Chronomly#8108 and Jdender~#2316',
          inline: true
        }, {
          name: '⚙ RAM usage',
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} megabytes`,
          inline: true
        }, {
          name: '🤑 Patrons',
          value: stripIndents`
          Become a patron [at my Patreon](https://dice.js.org/patreon).
          `
        }]
      });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
