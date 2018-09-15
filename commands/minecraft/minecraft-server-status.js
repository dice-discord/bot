const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/logger').scope('command', 'minecraft server status');
const rp = require('request-promise-native');

module.exports = class MinecraftServerStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'minecraft-server-status',
      group: 'minecraft',
      memberName: 'server-status',
      description: 'Get information about a Minecraft server.',
      aliases: ['mc-server', 'minecraft-server', 'mc-server-status', 'minecraft-server-status'],
      examples: ['minecraft-server-status us.mineplex.com', 'minecraft-server-status 127.0.0.1 25565'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [{
        key: 'ip',
        prompt: 'What is the IP address you want to look up?',
        type: 'string'
      }, {
        'key': 'port',
        'prompt': 'What is the server\'s port?',
        'type': 'integer',
        'default': 25565,
        'max': 65535,
        'min': 1
      }]
    });
  }

  run(msg, { ip, port }) {
    const options = {
      uri: `https://mcapi.us/server/status?ip=${ip}&port=${port}`,
      json: true
    };

    rp(options)
      .then(res => {
        logger.debug(`Server status for ${ip}:${port}`, JSON.stringify(res));
        if (res.status !== 'success') {
          return msg.reply('There was an error with your request.');
        }

        const embed = new MessageEmbed({
          title: ip,
          timestamp: res.last_updated
        });

        if (res.online === true) {
          embed.addField('🖥 Server Status', 'Currently online.', true);
          embed.addField('🖥 Version', res.server.name, true);
          embed.addField('👥 Members', `${res.players.now}/${res.players.max}`, true);
          embed.addField('📝 Message of the Day (MotD)', `\`\`\`${res.motd_formatted}\`\`\``, true);
          embed.setColor(0x4caf50);
        } else {
          if (res.last_online) {
            embed.addField('🖥 Server Status', `Offline. Last seen ${new Date(res.last_online)}`, true);
          } else {
            embed.addField('🖥 Server Status', 'Offline. Never seen online before.', true);
          }
          embed.setColor(0x607d8b);
        }
        return msg.reply(embed);
      })
      .catch(err => {
        logger.error(`${err}`);
        return msg.reply('An error occured.');
      });
  }
};
