import {bold} from 'discord-md-tags';
import {GuildMember, MessageEmbed, Snowflake, TextChannel} from 'discord.js';
import {Colors, Notifications} from '../../constants';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {channelCanBeNotified} from '../../util/notifications';

export default class GuildMemberAddListener extends DiceListener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: DiceListenerCategories.Client
		});
	}

	public static generateNotification(member: GuildMember): MessageEmbed {
		const embed = new MessageEmbed({
			title: 'New Member',
			timestamp: member.joinedAt ?? new Date(),
			thumbnail: {
				url: 'https://dice.js.org/images/statuses/guildMember/join.png'
			},
			color: Colors.Success,
			author: {
				name: `${member.user.tag} (${member.user.id})`,
				iconURL: member.user.displayAvatarURL({size: 128})
			},
			fields: [
				{
					name: 'Number of Server Members',
					value: `${bold`${member.guild.members.cache.size.toLocaleString()}`} members`
				}
			]
		});

		return embed;
	}

	public async exec(member: GuildMember): Promise<void> {
		const guildSettings = await this.client.prisma.guild.findOne({
			where: {id: member.guild.id},
			select: {notifications: {select: {channels: true}, where: {id: Notifications.GuildMemberJoinLeave}}}
		});

		if (guildSettings?.notifications?.length) {
			// This array will be a single element since we are filtering by notification ID above
			const [setting] = guildSettings.notifications;

			const embed = GuildMemberAddListener.generateNotification(member);

			setting.channels.forEach(async (channelID: Snowflake) => {
				// We do a check here instead of Array.prototype#filter since this is an async function
				if (await channelCanBeNotified(Notifications.GuildMemberJoinLeave, member.guild, channelID)) {
					const channel = this.client.channels.cache.get(channelID) as TextChannel;

					return channel.send(embed);
				}
			});
		}
	}
}
