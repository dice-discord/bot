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
const { MessageEmbed } = require('discord.js');
const logger = require('../../util/logger').scope('command', 'get minecraft body');

module.exports = class GetMinecraftBodyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'get-minecraft-body',
      group: 'minecraft',
      memberName: 'get-body',
      description: 'Shows a Minecraft user\'s body.',
      aliases: ['get-mc-body'],
      examples: ['get-minecraft-body Notch'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 3
      },
      args: [{
        key: 'user',
        prompt: 'What is username you want to look up?',
        type: 'string',
        label: 'username'
      }]
    });
  }

  run(msg, { user }) {
    const embed = new MessageEmbed({
      author: { name: user },
      image: { url: `https://minotar.net/body/${encodeURIComponent(user)}` }
    });

    logger.debug(`URL for ${user}:`, embed.image.url);
    return msg.reply(embed);
  }
};
