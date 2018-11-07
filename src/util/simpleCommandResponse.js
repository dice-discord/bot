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

const { emoji } = require('../config');

/**
 * Responds with a check mark to a message
 * @name respond
 * @param {Message} message Message to respond to
 */
module.exports = message => {
  const clientPermissions = message.channel.permissionsFor(message.guild.me);
  switch (message.channel.type) {
  case 'text':
    if (clientPermissions.has('ADD_REACTIONS')
      && clientPermissions.has('USE_EXTERNAL_EMOJIS')
      && message.client.emojis.has(emoji.success)) {
      // Can add the custom emoji
      message.react(emoji.success.id);
    } else if (clientPermissions.has('ADD_REACTIONS')) {
      // Can add a built-in emoji
      message.react('✅');
    } else if (clientPermissions.has('USE_EXTERNAL_EMOJIS')) {
      // Can use custom emoji in a message
      message.reply(emoji.success.message);
    } else {
      // Can't use custom emoji
      message.reply('✅');
    }
    break;
  case 'groupdm':
  case 'dm':
    message.react(emoji.success.id
    );
    break;
  }
};
