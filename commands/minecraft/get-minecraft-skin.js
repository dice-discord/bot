// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');

module.exports = class GetMinecraftSkinCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'get-minecraft-skin',
      group: 'minecraft',
      memberName: 'get-skin',
      description: 'Get the skin of a Minecraft user.',
      aliases: ['get-mc-skin'],
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
        image: { url: `https://minotar.net/skin/${encodeURIComponent(username)}` }
      }
    });
  }
};
