import {Message, MessageEmbed, TextChannel} from 'discord.js';
import {Notifications} from '../../constants';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {channelCanBeNotified} from '../../util/notifications';

export default class MessageUpdateListener extends DiceListener {
	public constructor() {
		super('messageUpdate', {
			emitter: 'client',
			event: 'messageUpdate',
			category: DiceListenerCategories.Client
		});
	}

	public static generateNotification(message: Message): MessageEmbed | null {
		if (message.guild) {
			const embed = new MessageEmbed({
				title: `Message edited (${message.id})`,
				color: 0xff9800,
				timestamp: message.editedAt!,
				footer: {
					text: `Message history is hidden to protect ${message.author.tag}'s privacy`
				},
				author: {
					name: `${message.author.tag} (${message.author.id})`,
					iconURL: message.author.displayAvatarURL({size: 128})
				},
				fields: [
					{
						name: 'Channel',
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						value: message.channel.toString(),
						inline: true
					},
					{
						name: 'Message',
						value: `[Jump to](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`,
						inline: true
					}
				]
			});

			return embed;
		}

		return null;
	}

	public async exec(oldMessage: Message, newMessage: Message): Promise<void> {
		if (newMessage.guild && newMessage.editedAt && (oldMessage.content !== newMessage.content || oldMessage.embeds.length !== newMessage.embeds.length)) {
			const guildSettings = await this.client.prisma.guild.findUnique({
				where: {id: oldMessage.guild!.id},
				select: {notifications: {select: {channels: true}, where: {id: Notifications.MessageUpdate}}}
			});

			if (guildSettings?.notifications?.length) {
				// This array will be a single element since we are filtering by notification ID above
				const [setting] = guildSettings.notifications;

				const embed = MessageUpdateListener.generateNotification(oldMessage);

				if (!embed) {
					return;
				}

				await Promise.all(
					setting.channels.map(async channelID => {
						if (await channelCanBeNotified(Notifications.MessageUpdate, oldMessage.guild!, channelID)) {
							const channel = this.client.channels.cache.get(channelID) as TextChannel;

							await channel.send(embed);
						}
					})
				);
			}
		}
	}
}
