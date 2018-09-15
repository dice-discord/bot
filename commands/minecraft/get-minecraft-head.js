// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');

module.exports = class GetMinecraftHeadCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'get-minecraft-head',
      group: 'minecraft',
      memberName: 'get-head',
      description: 'Shows an isometric view of a Minecraft user\'s head.',
      aliases: ['get-mc-head'],
      examples: ['get-minecraft-head Notch'],
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
        image: { url: `https://minotar.net/cube/${encodeURIComponent(username)}/100.png` }
      }
    });
  }
};
