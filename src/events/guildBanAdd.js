const announceGuildBanAdd = require("../notificationHandlers/guildBanAdd");

module.exports = async (guild, user) => {
  const { provider } = guild.client;
  const guildSettings = await provider.get(guild, "notifications");

  for (const id in guildSettings) {
    const channelSettings = guildSettings[id];

    if (
      guild.channels.has(id) &&
      channelSettings[0] === true &&
      guild.channels
        .get(id)
        .permissionsFor(guild.me)
        .has("SEND_MESSAGES")
    ) {
      // The channel in the database exists on the server and permissions to send messages are there
      announceGuildBanAdd(guild.channels.get(id), user);
    } else {
      // Missing permissions so remove this channel from the provider
      channelSettings[0] = false;
      guildSettings[id] = channelSettings;
      provider.set(guild, "notifications", guildSettings);
    }
  }
};
