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
const rp = require('request-promise-native');
const logger = require('../../util/logger').scope('command', 'random dog image');

module.exports = class RandomDogImageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'random-dog-image',
      group: 'fun',
      memberName: 'random-dog-image',
      description: 'Get a picture of a random dog.',
      aliases: ['random-dog', 'dog-image', 'dog'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  run(msg) {
    try {
      msg.channel.startTyping();

      const options = {
        uri: 'https://dog.ceo/api/breeds/image/random',
        json: true
      };
      rp(options)
        .then(result => msg.replyEmbed({
          author: {
            name: 'dog.ceo',
            iconURL: 'https://dog.ceo/img/favicon.png',
            url: 'https://dog.ceo/dog-api/'
          },
          image: { url: result.message }
        }))
        .catch(error => {
          logger.error(error);
          return msg.reply('There was an error with the API we use (http://dog.ceo/dog-api)');
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
