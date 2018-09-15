// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/logger').scope('command', 'get minecraft body');

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
