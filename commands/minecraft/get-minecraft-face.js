// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');

module.exports = class GetMinecraftFaceCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'get-minecraft-face',
      group: 'minecraft',
      memberName: 'get-face',
      description: 'Shows a front view of a Minecraft user\'s face.',
      aliases: ['get-mc-face'],
      examples: ['get-minecraft-face Notch'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 3
      },
      args: [{
        key: 'username',
        prompt: 'What user do you want to look up?',
        type: 'string'
      }]
    });
  }

  run(msg, { username }) {
    return msg.reply({
      embed: {
        author: {
          name: username,
          // eslint-disable-next-line camelcase
          icon_url: `https://minotar.net/helm/${encodeURIComponent(username)}`
        },
        image: { url: `https://minotar.net/helm/${encodeURIComponent(username)}` }
      }
    });
  }
};
