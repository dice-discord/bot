const { MessageEmbed } = require("discord.js");

module.exports = async (oldMsg, newMsg) => {
  const { client } = newMsg;

  const guildSettings = await client.provider.get(
    newMsg.guild,
    "notifications"
  );
  const channels = [];

  for (const id in guildSettings) {
    const channelSettings = guildSettings[id];
    if (
      newMsg.guild.channels.has(id) &&
      channelSettings[6] === true &&
      newMsg.guild.channels
        .get(id)
        .permissionsFor(newMsg.guild.me)
        .has("SEND_MESSAGES")
    ) {
      // The channel in the database exists on the server and permissions to send messages are there
      channels.push(newMsg.guild.channels.get(id));
    } else {
      // Missing permissions so remove this channel from the provider
      channelSettings[6] = false;
      guildSettings[id] = channelSettings;
      client.provider.set(newMsg.guild, "notifications", guildSettings);
    }
  }

  if (
    channels.length > 0 &&
    newMsg.editedAt &&
    (oldMsg.content !== newMsg.content ||
      oldMsg.embeds.length !== newMsg.embeds.length)
  ) {
    const embed = new MessageEmbed({
      title: `Message edited (${newMsg.id})`,
      color: 0xff9800,
      timestamp: newMsg.editedAt,
      footer: {
        text: `Message history is hidden to protect ${
          newMsg.author.tag
        }'s privacy`
      },
      author: {
        name: `${newMsg.author.tag} (${newMsg.author.id})`,
        // eslint-disable-next-line camelcase
        icon_url: newMsg.author.displayAvatarURL(128)
      },
      fields: [
        {
          name: "Channel",
          value: newMsg.channel.toString()
        },
        {
          name: "Message",
          value: `[Jump to](https://discordapp.com/channels/${
            newMsg.guild.id
          }/${newMsg.channel.id}/${newMsg.id})`
        }
      ]
    });

    channels.forEach(channel => channel.send(embed));
  }
};
