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

const { MessageEmbed } = require("discord.js");
const { formatDistance } = require("date-fns");

/**
 * Announces the leaving of a member on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} member User who left
 */
module.exports = (channel, member) => {
  const embed = new MessageEmbed({
    title: "Member Left",
    timestamp: new Date(),
    color: 0xf44336,
    thumbnail: {
      url: "https://dice.js.org/images/statuses/guildMember/leave.png"
    },
    author: {
      name: `${member.user.tag} (${member.user.id})`,
      iconURL: member.user.displayAvatarURL(128)
    },
    fields: [
      {
        name: "Number of Server Members",
        value: `\`${channel.guild.members.size}\` members`
      }
    ]
  });

  if (member.joinedAt) embed.setFooter(`Member for ${formatDistance(member.joinedAt, new Date())}`);

  return channel.send(embed);
};
