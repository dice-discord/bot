const announceGuildMemberUpdate = require("../notificationHandlers/guildMemberUpdate");

module.exports = async (oldMember, newMember) => {
  const { client } = newMember;

  const guildSettings = await client.provider.get(newMember.guild, "notifications");

  for (const id in guildSettings) {
    const channelSettings = guildSettings[id];

    if (
      newMember.guild.channels.has(id) &&
      channelSettings[3] === true &&
      newMember.guild.channels
        .get(id)
        .permissionsFor(newMember.guild.me)
        .has("SEND_MESSAGES")
    ) {
      // The channel in the database exists on the server and permissions to send messages are there
      announceGuildMemberUpdate(newMember.guild.channels.get(id), oldMember, newMember);
    } else {
      // Missing permissions so remove this channel from the provider
      channelSettings[3] = false;
      guildSettings[id] = channelSettings;
      client.provider.set(newMember.guild, "notifications", guildSettings);
    }
  }
};
