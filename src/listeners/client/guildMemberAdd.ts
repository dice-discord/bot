import convert, {ms} from 'convert';
import {sub} from 'date-fns';
import {bold} from 'discord-md-tags';
import {GuildMember, MessageEmbed, TextChannel} from 'discord.js';
import {Colors, Notifications} from '../../constants';
import {baseLogger} from '../../logging/logger';
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
					value: `${bold`${member.guild.memberCount.toLocaleString()}`} members`
				}
			]
		});

		return embed;
	}

	public async exec(member: GuildMember): Promise<void> {
		const username = member.user.username.toLowerCase();
		const ageMs = member.user.createdTimestamp - Date.now();

		if ((username.includes('twitter.com/h0nde') || username.includes('h0nda')) && ageMs < convert(1).from('minutes').to('milliseconds')) {
			if (member.bannable) {
				try {
					await member.ban({reason: 'Automated action: malicious bot'});
					baseLogger.info(`banned ${member.user.id} on join`);
				} catch {
					baseLogger.info(`failed to ban ${member.user.id} on join`);
				}
			} else if (member.kickable) {
				try {
					await member.kick('Automated action: malicious bot');
					baseLogger.info(`kicked ${member.user.id} on join`);
				} catch {
					baseLogger.info(`failed to kick ${member.user.id} on join`);
				}
			}
		}

		const guildSettings = await this.client.prisma.guild.findUnique({
			where: {id: member.guild.id},
			select: {notifications: {select: {channels: true}, where: {id: Notifications.GuildMemberJoinLeave}}}
		});

		if (guildSettings?.notifications?.length) {
			// This array will be a single element since we are filtering by notification ID above
			const [setting] = guildSettings.notifications;

			const embed = GuildMemberAddListener.generateNotification(member);

			await Promise.all(
				setting.channels.map(async channelID => {
					if (await channelCanBeNotified(Notifications.GuildMemberJoinLeave, member.guild, channelID)) {
						const channel = this.client.channels.cache.get(channelID) as TextChannel;

						await channel.send(embed);
					}
				})
			);
		}
	}
}
