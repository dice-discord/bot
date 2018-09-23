// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/logger').scope('command', 'get minecraft mini me');

module.exports = class GetMinecraftMiniMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'get-minecraft-mini-me',
      group: 'minecraft',
      memberName: 'get-mini-me',
      // eslint-disable-next-line max-len
      description: 'Shows a \'mini-me\' of a Minecraft user\'s body with an option for a transparent background or gradient.',
      aliases: ['minecraft-mini-me', 'mc-mini-me', 'minecraft-mini', 'mc-mini-me'],
      examples: ['get-minecraft-mini-me Notch', 'get-minecraft-mini-me Notch false'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 3
      },
      args: [{
        key: 'username',
        prompt: 'What user do you want to look up?',
        type: 'string'
      }, {
        key: 'transparency',
        prompt: 'Should the background be transparent?',
        type: 'boolean',
        default: true
      }]
    });
  }

  run(msg, { username, transparency }) {
    logger.debug('Transparency value:', transparency);

    const embed = new MessageEmbed({
      author: {
        name: username,
        url: `http://minecraftskinavatar.com/customize?id=${encodeURIComponent(username)}&source=minecraft`,
        // eslint-disable-next-line camelcase
        icon_url: `https://minotar.net/helm/${encodeURIComponent(username)}`
      },
      footer: { text: 'Provided by minecraftskinavatar.com' }
    });

    if (transparency) {
      // eslint-disable-next-line max-len
      embed.setImage(`http://avatar.yourminecraftservers.com/avatar/trnsp/steve/tall/128/${encodeURIComponent(username)}.png`);
    } else {
      // eslint-disable-next-line max-len
      embed.setImage(`http://avatar.yourminecraftservers.com/avatar/rad/steve/tall/128/${encodeURIComponent(username)}.png`);
    }
    logger.debug(`Image URL for ${username}: ${embed.image.url}`);
    return msg.reply(embed);
  }
};
