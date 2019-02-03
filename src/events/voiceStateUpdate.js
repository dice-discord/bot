const announceVoiceChannelUpdate = require("../notificationHandlers/voiceChannelUpdate");

module.exports = async (oldVoiceState, newVoiceState) => {
  const { client } = newVoiceState.guild;

  const guildSettings = await client.provider.get(
    newVoiceState.guild,
    "notifications"
  );

  for (const id in guildSettings) {
    const channelSettings = guildSettings[id];

    if (
      newVoiceState.guild.channels.has(id) &&
      channelSettings[2] === true &&
      newVoiceState.guild.channels
        .get(id)
        .permissionsFor(newVoiceState.guild.me)
        .has("SEND_MESSAGES")
    ) {
      // The channel in the database exists on the server and permissions to send messages are there
      if (oldVoiceState.channel || newVoiceState.channel) {
        announceVoiceChannelUpdate(
          newVoiceState.guild.channels.get(id),
          oldVoiceState,
          newVoiceState
        );
      }
    } else {
      // Missing permissions so remove this channel from the provider
      channelSettings[2] = false;
      guildSettings[id] = channelSettings;
      client.provider.set(newVoiceState.guild, "notifications", guildSettings);
    }
  }
};
