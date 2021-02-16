import {GuildMember, MessageEmbed, Snowflake, TextChannel, Util} from 'discord.js';
import {Colors, Notifications} from '../../constants';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {channelCanBeNotified} from '../../util/notifications';

export default class GuildMemberUpdateListener extends DiceListener {
	public constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate',
			category: DiceListenerCategories.Client
		});
	}

	public static generateNotification(oldMember: GuildMember, newMember: GuildMember): MessageEmbed | null {
		const embed = new MessageEmbed({
			timestamp: new Date(),
			author: {
				name: `${newMember.user.tag} (${newMember.user.id})`,
				iconURL: newMember.user.displayAvatarURL({size: 128})
			}
		});

		if (oldMember.nickname === null && newMember.nickname !== null) {
			// New nickname, no old nickname
			embed
				.setTitle('New Member Nickname')
				.addField('New nickname', Util.escapeMarkdown(newMember.nickname))
				.setColor(Colors.Success)
				.setThumbnail('https://dice.js.org/images/statuses/guildMemberUpdate/new.png');

			return embed;
		}

		if (oldMember.nickname !== null && newMember.nickname === null) {
			// Reset nickname
			embed
				.setTitle('Member Nickname Removed')
				.addField('Previous nickname', Util.escapeMarkdown(oldMember.nickname))
				.setColor(Colors.Error)
				.setThumbnail('https://dice.js.org/images/statuses/guildMemberUpdate/removed.png');

			return embed;
		}

		if (oldMember.nickname !== null && newMember.nickname !== null && oldMember.nickname !== newMember.nickname) {
			// Nickname change
			embed
				.setTitle('Changed Member Nickname')
				.addField('New nickname', Util.escapeMarkdown(newMember.nickname), true)
				.addField('Previous nickname', Util.escapeMarkdown(oldMember.nickname), true)
				.setColor(Colors.Warning)
				// For some godforsaken reason this image is not using the correct color
				// TODO: Recreate image with proper background color
				.setThumbnail('https://dice.js.org/images/statuses/guildMemberUpdate/changed.png');

			return embed;
		}

		return null;
	}

	public async exec(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
		const guildSettings = await this.client.prisma.guild.findUnique({
			where: {id: newMember.guild.id},
			select: {notifications: {select: {channels: true}, where: {id: Notifications.GuildMemberUpdate}}}
		});

		if (guildSettings?.notifications?.length) {
			// This array will be a single element since we are filtering by notification ID above
			const [setting] = guildSettings.notifications;

			const embed = GuildMemberUpdateListener.generateNotification(oldMember, newMember);

			if (!embed) {
				return;
			}

			await Promise.all(
				setting.channels.map(async channelID => {
					if (await channelCanBeNotified(Notifications.GuildMemberUpdate, newMember.guild, channelID)) {
						const channel = this.client.channels.cache.get(channelID) as TextChannel;

						await channel.send(embed);
					}
				})
			);
		}
	}
}
