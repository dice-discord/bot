const { MessageEmbed } = require('discord.js');
const wait = require('../util/wait');

/**
 * Announces the banning or unbanning of a user on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {User} user User who was banned
 */
module.exports = async (channel, user) => {
  const embed = new MessageEmbed({
    title: `${user.tag} was banned`,
    author: {
      name: `${user.tag} (${user.id})`,
      iconURL: user.displayAvatarURL(128)
    },
    color: 0xf44336,
    thumbnail: { url: 'https://dice.js.org/images/status/banUnban/ban.png' }
  });

  if (channel.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
    // Hope that Discord has updated the audit log
    await wait(1000);

    const auditLogs = await channel.guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' });
    const auditEntry = auditLogs.entries.first();

    if (auditEntry.reason) embed.addField('Reason', auditEntry.reason);
    embed.setTimestamp(auditEntry.createdAt);
    embed.setFooter(
      `Banned by ${auditEntry.executor.tag} (${auditEntry.executor.id})`,
      auditEntry.executor.displayAvatarURL(128)
    );
  } else {
    embed.setFooter('Give me permissions to view the audit log and more information will appear');
    embed.setTimestamp(new Date());
  }


  channel.send({ embed });
};
