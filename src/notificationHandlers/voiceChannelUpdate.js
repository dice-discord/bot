/*
Copyright 2019 Jonah Snider

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

const { MessageEmbed, Util } = require("discord.js");

/**
 * Announces a guild member's voice connection status
 * @param {TextChannel} channel Channel to send the embed
 * @param {VoiceState} oldVoiceState Old voice state from update
 * @param {VoiceState} newVoiceState New voice state from update
 */
module.exports = (channel, oldVoiceState, newVoiceState) => {
  const { member } = newVoiceState;
  const { user } = member;
  const embed = new MessageEmbed({
    timestamp: new Date(),
    author: {
      name: `${user.tag} (${newVoiceState.id})`,
      iconURL: user.displayAvatarURL(128)
    }
  });

  if (oldVoiceState.channel && newVoiceState.channel && oldVoiceState.channel !== newVoiceState.channel) {
    // Transfering from one voice channel to another
    embed
      .setTitle("Switched voice channels")
      .setColor(0xff9800)
      .addField("Old voice channel", Util.escapeMarkdown(oldVoiceState.channel.name))
      .addField("New voice channel", Util.escapeMarkdown(newVoiceState.channel.name))
      .setThumbnail("https://dice.js.org/images/statuses/voiceChannel/transfer.png");
    return channel.send(embed);
  } else if (newVoiceState.channel && newVoiceState.channel !== oldVoiceState.channel) {
    // Connected to a voice channel
    embed
      .setTitle("Connected to a voice channel")
      .setColor(0x4caf50)
      .addField("Voice channel", Util.escapeMarkdown(newVoiceState.channel.name))
      .setThumbnail("https://dice.js.org/images/statuses/voiceChannel/join.png");
    return channel.send(embed);
  } else if (oldVoiceState.channel && newVoiceState.channel !== oldVoiceState.channel) {
    // Disconnected from a voice channel
    embed
      .setTitle("Disconnected from a voice channel")
      .setColor(0xf44336)
      .addField("Voice channel", Util.escapeMarkdown(oldVoiceState.channel.name))
      .setThumbnail("https://dice.js.org/images/statuses/voiceChannel/leave.png");
    return channel.send(embed);
  }

  return null;
};
