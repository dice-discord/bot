import assert from 'assert';
import {Message, MessageEmbed, TextChannel} from 'discord.js';
import {Colors, Notifications} from '../../constants';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {channelCanBeNotified} from '../../util/notifications';

export default class MessageDeleteListener extends DiceListener {
	public constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete',
			category: DiceListenerCategories.Client
		});
	}

	public static generateNotification(message: Message): MessageEmbed {
		const embed = new MessageEmbed({
			title: 'Message Deleted',
			color: Colors.Error,
			timestamp: new Date(),
			footer: {
				text: `Message content is hidden to protect ${message.author.tag}'s privacy`
			},
			author: {
				name: `${message.author.tag} (${message.author.id})`,
				iconURL: message.author.displayAvatarURL({size: 128})
			},
			fields: [
				{
					name: 'Channel',
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					value: message.channel.toString()
				}
			]
		});

		return embed;
	}

	public async exec(message: Message): Promise<void> {
		if (message.channel.type === 'text') {
			assert(message.guild);

			const guildSettings = await this.client.prisma.guild.findUnique({
				where: {id: message.guild.id},
				select: {notifications: {select: {channels: true}, where: {id: Notifications.MessageDelete}}}
			});

			if (guildSettings?.notifications?.length) {
				// This array will be a single element since we are filtering by notification ID above
				const [setting] = guildSettings.notifications;

				const embed = MessageDeleteListener.generateNotification(message);

				await Promise.all(
					setting.channels.map(async channelID => {
						assert(message.guild);

						if (await channelCanBeNotified(Notifications.MessageDelete, message.guild, channelID)) {
							const channel = this.client.channels.cache.get(channelID) as TextChannel;

							await channel.send(embed);
						}
					})
				);
			}
		}
	}
}
