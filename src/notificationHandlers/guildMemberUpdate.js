const { MessageEmbed, Util } = require("discord.js");

/**
 * Announces a guild member update
 * @param {TextChannel} channel Channel to send the embed
 * @param {GuildMember} oldMember Old member from update
 * @param {GuildMember} newMember New member from update
 */
module.exports = (channel, oldMember, newMember) => {
  const embed = new MessageEmbed({
    timestamp: new Date(),
    author: {
      name: `${newMember.user.tag} (${newMember.user.id})`,
      // eslint-disable-next-line camelcase
      icon_url: newMember.user.displayAvatarURL(128)
    }
  });

  if (!oldMember.nickname && oldMember.nickname !== newMember.nickname) {
    // New nickname, no old nickname
    embed
      .setTitle("New Member Nickname")
      .addField("New nickname", Util.escapeMarkdown(newMember.nickname))
      .setColor("#4caf50")
      .setThumbnail(
        "https://dice.js.org/images/statuses/guildMemberUpdate/new.png"
      );
    return channel.send(embed);
  } else if (!newMember.nickname && oldMember.nickname !== newMember.nickname) {
    // Reset nickname
    embed
      .setTitle("Member Nickname Removed")
      .addField("Previous nickname", Util.escapeMarkdown(oldMember.nickname))
      .setColor("#f44336")
      .setThumbnail(
        "https://dice.js.org/images/statuses/guildMemberUpdate/removed.png"
      );
    return channel.send(embed);
  } else if (oldMember.nickname !== newMember.nickname) {
    // Nickname change
    embed
      .setTitle("Changed Member Nickname")
      .addField("New nickname", Util.escapeMarkdown(newMember.nickname))
      .addField("Previous nickname", Util.escapeMarkdown(oldMember.nickname))
      .setColor("#ffc107")
      .setThumbnail(
        "https://dice.js.org/images/statuses/guildMemberUpdate/changed.png"
      );
    return channel.send(embed);
  }

  return null;
};
