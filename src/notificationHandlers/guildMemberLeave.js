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
