const announceGuildMemberLeave = require("../notificationHandlers/guildMemberLeave");

module.exports = async member => {
  const { client } = member.client;

  const guildSettings = await client.provider.get(
    member.guild,
    "notifications"
  );

  for (const id in guildSettings) {
    const channelSettings = guildSettings[id];

    if (
      member.guild.channels.has(id) &&
      channelSettings[1] === true &&
      member.guild.channels
        .get(id)
        .permissionsFor(member.guild.me)
        .has("SEND_MESSAGES")
    ) {
      // The channel in the database exists on the server and permissions to send messages are there
      announceGuildMemberLeave(member.guild.channels.get(id), member);
    } else {
      // Missing permissions so remove this channel from the provider
      channelSettings[1] = false;
      guildSettings[id] = channelSettings;
      client.provider.set(member.guild, "notifications", guildSettings);
    }
  }
};
