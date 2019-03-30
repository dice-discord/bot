const SentryCommand = require("../../structures/SentryCommand");
const { MessageEmbed } = require("discord.js");
const logger = require("../../util/logger").scope("command", "minecraft server status");
const axios = require("axios");

module.exports = class MinecraftServerStatusCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "minecraft-server-status",
      group: "minecraft",
      memberName: "server-status",
      description: "Get information about a Minecraft server.",
      aliases: ["mc-server", "minecraft-server", "mc-server-status", "minecraft-server-status"],
      examples: ["minecraft-server-status us.mineplex.com", "minecraft-server-status 127.0.0.1 25565"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: "ip",
          prompt: "What is the IP address you want to look up?",
          type: "string"
        },
        {
          key: "port",
          prompt: "What is the server's port?",
          type: "integer",
          default: 25565,
          max: 65535,
          min: 1
        }
      ]
    });
  }

  async exec(msg, { ip, port }) {
    const res = (await axios(`https://mcapi.us/server/status?ip=${ip}&port=${port}`).catch(error => {
      logger.error(error);
      return msg.reply("An error occured.");
    })).data;

    if (res.status !== "success") {
      return msg.reply("There was an error with your request.");
    }

    const embed = new MessageEmbed({
      title: ip,
      timestamp: res.last_updated,
      color: res.online ? 0x4caf50 : 0x607d8b
    });

    if (res.online) {
      embed.addField("Server Status", "Currently online.", true);
      embed.addField("Version", res.server.name, true);
      embed.addField("Members", `${res.players.now}/${res.players.max}`, true);
      embed.addField("Message of the Day (MotD)", `\`\`\`${res.motd}\`\`\``, true);
    } else if (res.last_online) {
      embed.addField("Server Status", `Offline. Last seen ${new Date(res.last_online)}`, true);
    } else {
      embed.addField("Server Status", "Offline. Never seen online before.", true);
    }
    return msg.reply(embed);
  }
};
