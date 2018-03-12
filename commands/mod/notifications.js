// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { respond } = require('../../providers/simpleCommandResponse');
const winston = require('winston');

module.exports = class NotificationsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'notifications',
			aliases: ['notification', 'notify', 'alerts', 'server-notifications', 'server-notification', 'server-notify', 'server-alerts'],
			group: 'mod',
			memberName: 'notifications',
			description: 'Check or set what notifications for server events are sent to a channel',
			details: 'Not specifying an event type to toggle will list the statuses of all events in the channel',
			userPermissions: ['MANAGE_GUILD'],
			examples: ['notifications 1', 'notifications'],
			guildOnly: true,
			args: [{
				key: 'notification',
				prompt: 'Which notification do you want to toggle for this channel?',
				type: 'integer',
				min: 1,
				max: 4,
				default: false
			}],
			throttling: {
				usages: 2,
				duration: 10
			}
		});
	}

	async run(msg, { notification }) {
		// Get this guild's settings in the form of notification settings mapped by channel ID
		const guildSettings = this.client.provider.get(msg.guild, 'notifications', {});

		if (!guildSettings[msg.channel.id]) {
			winston.debug(`[COMMAND](NOTIFICATIONS) The channel ${msg.channel.name} does not have settings, will set them to the default`);
			// This channel doesn't have settings for it so set it to the default values (everything disabled)
			guildSettings[msg.channel.id] = [{
				label: 'ban and kick',
				name: 'banKick',
				enabled: false
			}, {
				label: 'member join and leave',
				name: 'guildMemberJoinLeave',
				enabled: false
			}, {
				label: 'voice channel',
				name: 'voiceChannel',
				enabled: false
			}, {
				label: 'nickname change',
				name: 'guildMemberUpdate',
				enabled: false
			}];
		}
		// Get the settings
		const channelSettings = guildSettings[msg.channel.id];
		winston.debug(`[COMMAND](NOTIFICATIONS) Channel settings for ${msg.channel.name}:`, channelSettings);

		if (notification) {
			// If the setting was specified

			// Toggle the enabled value on our local settings
			channelSettings[notification - 1].enabled = !channelSettings[notification - 1].enabled;

			// Set the local guild settings for this channel to our updated configuration
			guildSettings[msg.channel.id] = channelSettings;

			// Set the guild settings to our updated version
			await this.client.provider.set(msg.guild, 'notifications', guildSettings);

			// Respond to author with success
			respond(msg);
		} else {
			// If the setting was unspecified
			const embed = new MessageEmbed({ title: `Notifications for #${msg.channel.name}` });

			channelSettings.forEach(item => {
				embed.addField(`${item.enabled ? 'Disable' : 'Enable'} ${item.label} notifications`, `Use ${msg.anyUsage(`notification ${channelSettings.indexOf(item) + 1}`)} to **${item.enabled ? 'disable' : 'enable'}** this item`);
			});

			return msg.replyEmbed(embed);
		}
	}
};
