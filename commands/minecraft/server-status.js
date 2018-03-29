const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');
const rp = require('request-promise-native');

module.exports = class ServerStatusCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'server-status',
			group: 'minecraft',
			memberName: 'server-status',
			description: 'Get information about a Minecraft server',
			aliases: ['mc-server', 'minecraft-server', 'mc-server-status', 'minecraft-server-status'],
			examples: ['server-status us.mineplex.com', 'server-status 127.0.0.1 25565'],
			throttling: {
				usages: 1,
				duration: 5
			},
			args: [
				{
					key: 'ip',
					prompt: 'What is the IP address you want to look up?',
					type: 'string'
				},
				{
					key: 'port',
					prompt: 'What\'s the server port?',
					type: 'integer',
					default: 25565,
					max: 65535,
					min: 1
				}
			]
		});
	}

	run(msg, { ip, port }) {
		const options = {
			uri: `https://mcapi.us/server/status?ip=${ip}&port=${port}`,
			json: true
		};

		rp(options)
			.then(async output => {
				const response = await output;
				winston.debug(
					`[API](MINECRAFT) Server status for ${ip}:${port}`,
					response
				);
				if(response.status !== 'success') {
					return msg.reply('❌ There was an error with your request.');
				}

				const embed = new MessageEmbed({
					title: ip,
					timestamp: response.last_updated
				});

				if(response.online === true) {
					embed.addField('🖥 Server Status', 'Currently online.', true);
					embed.addField('🖥 Version', response.server.name, true);
					embed.addField('👥 Members', `${response.players.now}/${response.players.max}`, true);
					embed.addField('📝 Message of the Day (MotD)', `\`\`\`${response.motd_formatted}\`\`\``, true);
					embed.setColor(0x4caf50);
				} else {
					if(response.last_online) {
						embed.addField('🖥 Server Status', `Offline. Last seen ${new Date(response.last_online)}`, true);
					} else {
						embed.addField('🖥 Server Status', 'Offline. Never seen online before.', true);
					}
					embed.setColor(0x607d8b);
				}
				return msg.reply(embed);
			})
			.catch(err => {
				winston.error(`[API](MINECRAFT) ${err}`);
			});
	}
};
