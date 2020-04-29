import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message, MessageEmbed, Permissions, TextChannel, Snowflake} from 'discord.js';
import {notifications as globalNotifications, Notifications} from '../../constants';
import {ArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

const notificationIDs = Object.keys(globalNotifications) as Notifications[];

export default class NotificationsCommand extends DiceCommand {
	constructor() {
		super('notifications', {
			aliases: ['notification', 'notify', 'alerts', 'server-notifications', 'server-notification', 'server-notify', 'server-alerts'],
			category: DiceCommandCategories.Moderation,
			description: {
				content: 'Check or set what notifications for server events are sent to a channel.',
				usage: '[notification number]',
				examples: ['', '1']
			},
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			channel: 'guild',
			args: [
				{
					id: 'notification',
					type: Argument.range(ArgumentType.Integer, 1, notificationIDs.length, true),
					match: 'content',
					prompt: {
						optional: true,
						retry: `Invalid notification selected, please provide a whole number from 1 to ${notificationIDs.length.toLocaleString()}`
					}
				}
			]
		});
	}

	async exec(message: Message, args: {notification: number | null}): Promise<Message | undefined> {
		const notifications = await this.client.prisma.notificationSettings.findMany({where: {guildId: message.guild!.id}, select: {channels: true, id: true}});

		if (args.notification) {
			/** The ID of the notification referenced in the args. */
			const notificationIDFromArgs = notificationIDs[args.notification - 1];

			/** This is the notification object the user referenced in the args. */
			const actualNotification = notifications.find(notification => notification.id === notificationIDFromArgs);

			const notificationChannels: Set<Snowflake> = new Set(actualNotification?.channels);

			let result: 'disabled' | 'enabled';
			if (notifications.length !== 0 && notificationChannels.has(message.channel.id)) {
				// This channel has the specified notification set enabled

				notificationChannels.delete(message.channel.id);

				// This upsert section is really similar to the one in the branch below, make sure to copy changes between them
				await this.client.prisma.notificationSettings.update({
					where: {id_guildId: {guildId: message.guild!.id, id: notificationIDFromArgs}},
					data: {channels: {set: [...notificationChannels]}}
				});

				await this.client.prisma.notificationSettings.upsert({
					where: {id_guildId: {id: notificationIDFromArgs, guildId: message.guild!.id}},
					create: {
						id: notificationIDFromArgs,
						guild: {create: {id: message.guild!.id}},
						channels: {set: [...notificationChannels]}
					},
					update: {
						channels: {set: [...notificationChannels]}
					}
				});

				result = 'disabled';
			} else {
				// Guild may or may not exist, but the selected notification definitely is disabled

				// This update section is really similar to the one in the branch above, make sure to copy changes between them
				await this.client.prisma.notificationSettings.upsert({
					where: {id_guildId: {id: notificationIDFromArgs, guildId: message.guild!.id}},
					create: {
						id: notificationIDFromArgs,
						guild: {create: {id: message.guild!.id}},
						// Add this channel to the selected notification's list, different than the above block,
						channels: {set: [message.channel.id]}
					},
					update: {
						channels: {set: [...notificationChannels].concat(message.channel.id)}
					}
				});

				result = 'enabled';
			}

			return message.util?.send(`Notifications for ${bold`${clean(Object.values(globalNotifications)[args.notification - 1], message)}`} were ${result}`);
		}

		const embed = new MessageEmbed({
			title: `Notifications for #${(message.channel as TextChannel).name}`
		});

		Object.entries(globalNotifications).forEach(([id, description], index) => {
			/** Whether or not this notification is enabled in this channel. */
			const enabled = notifications.length === 0 ? false : notifications.find(notification => notification.id === id)?.channels.includes(message.channel.id);

			return embed.addField(`#${index + 1} Notifications for ${description}`, enabled ? bold`✅ Enabled` : '❌ Not enabled');
		});

		return message.util?.send(embed);
	}
}
