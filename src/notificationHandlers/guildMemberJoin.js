const { MessageEmbed } = require('discord.js');

/**
 * Announces the joining of a member on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} member Member who joined
 */
module.exports = (channel, member) => {
  const embed = new MessageEmbed({
    title: 'New Member',
    timestamp: member.joinedAt,
    thumbnail: {
      url: 'https://dice.js.org/images/statuses/guildMember/join.png'
    },
    color: 0x4caf50,
    author: {
      name: `${member.user.tag} (${member.user.id})`,
      // eslint-disable-next-line camelcase
      icon_url: member.user.displayAvatarURL(128)
    },
    fields: [{
      name: 'Number of Server Members',
      value: `\`${channel.guild.members.size}\` members`
    }]
  });

  if (member.joinedAt) {
    embed.setTimestamp(member.joinedAt);
  } else {
    embed.setTimestamp();
  }

  return channel.send(embed);
};
