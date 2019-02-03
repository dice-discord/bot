const { MessageEmbed } = require("discord.js");

module.exports = async msg => {
  const { client } = msg;

  const guildSettings = await client.provider.get(msg.guild, "notifications");
  const channels = [];

  for (const id in guildSettings) {
    const channelSettings = guildSettings[id];

    if (
      msg.guild.channels.has(id) &&
      channelSettings[5] === true &&
      msg.guild.channels
        .get(id)
        .permissionsFor(msg.guild.me)
        .has("SEND_MESSAGES")
    ) {
      // The channel in the database exists on the server and permissions to send messages are there
      channels.push(msg.guild.channels.get(id));
    } else {
      // Missing permissions so remove this channel from the provider
      channelSettings[5] = false;
      guildSettings[id] = channelSettings;
      client.provider.set(msg.guild, "notifications", guildSettings);
    }
  }

  if (channels.length > 0) {
    const embed = new MessageEmbed({
      title: "Message Deleted",
      color: 0xf44336,
      timestamp: new Date(),
      footer: {
        text: `Message content is hidden to protect ${msg.author.tag}'s privacy`
      },
      author: {
        name: `${msg.author.tag} (${msg.author.id})`,
        // eslint-disable-next-line camelcase
        icon_url: msg.author.displayAvatarURL(128)
      },
      fields: [
        {
          name: "Channel",
          value: msg.channel.toString()
        }
      ]
    });

    channels.forEach(channel => channel.send(embed));
  }
};
