// Copyright Jonah Snider 2018

const { successEmoji } = require('../config');

/**
 * Responds with a check mark to a message
 * @function
 * @name respond
 * @param {Message} message Message to respond to
 */
const respond = message => {
  switch (message.channel.type) {
  case 'text':
    if (message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS') &&
        message.channel.permissionsFor(message.guild.me).has('USE_EXTERNAL_EMOJIS') &&
        message.client.emojis.has(successEmoji)) {
      // Can add the custom emoji
      message.react(successEmoji);
    } else if (message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
      // Can add a built-in emoji
      message.react('✅');
    } else if (message.channel.permissionsFor(message.guild.me).has('USE_EXTERNAL_EMOJIS') &&
        message.client.emojis.has(successEmoji)) {
      // Can use custom emoji in a message
      message.reply('<:success:406965554629574658>');
    } else {
      // Can't use custom emoji
      message.reply('✅');
    }
    break;
  case 'groupdm':
  case 'dm':
    message.react(successEmoji);
    break;
  }
};
module.exports.respond = respond;
