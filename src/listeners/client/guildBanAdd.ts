import delay from 'delay';
import {Guild, MessageEmbed, TextChannel, User} from 'discord.js';
import {Colors, Notifications} from '../../constants';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {channelCanBeNotified} from '../../util/notifications';

export default class GuildBanAddListener extends DiceListener {
	public constructor() {
		super('guildBanAdd', {
			emitter: 'client',
			event: 'guildBanAdd',
			category: DiceListenerCategories.Client
		});
	}

	public static async generateNotification(guild: Guild, user: User): Promise<MessageEmbed> {
		const embed = new MessageEmbed({
			title: `${user.tag} was banned`,
			author: {
				name: `${user.tag} (${user.id})`,
				iconURL: user.displayAvatarURL({size: 128})
			},
			color: Colors.Error,
			thumbnail: {url: 'https://dice.js.org/images/statuses/banUnban/ban.png'}
		});

		if (guild.me?.hasPermission('VIEW_AUDIT_LOG')) {
			// Hope that Discord has updated the audit log with the ban event
			// Sometimes it takes a bit, and if we have the wrong value it will say someone else was banned
			await delay(1000);

			const auditLogs = await guild.fetchAuditLogs({
				type: 'MEMBER_BAN_ADD'
			});
			const auditEntry = auditLogs.entries.first();

			if (auditEntry) {
				if (auditEntry.reason !== null) {
					embed.addField('Reason', auditEntry.reason);
				}

				embed.setTimestamp(auditEntry.createdAt);
				embed.setFooter(`Banned by ${auditEntry.executor.tag} (${auditEntry.executor.id})`, auditEntry.executor.displayAvatarURL({size: 128}));
			}
		} else {
			embed.setFooter('Give me permissions to view the audit log and more information will appear');
			embed.setTimestamp(new Date());
		}

		return embed;
	}

	public async exec(guild: Guild, user: User): Promise<void> {
		const guildSettings = await this.client.prisma.guild.findUnique({
			where: {id: guild.id},
			select: {notifications: {select: {channels: true}, where: {id: Notifications.BanUnban}}}
		});

		if (guildSettings?.notifications?.length) {
			// This array will be a single element since we are filtering by notification ID above
			const [setting] = guildSettings.notifications;

			const embed = await GuildBanAddListener.generateNotification(guild, user);

			await Promise.all(
				setting.channels.map(async channelID => {
					if (await channelCanBeNotified(Notifications.BanUnban, guild, channelID)) {
						const channel = this.client.channels.cache.get(channelID) as TextChannel;

						await channel.send(embed);
					}
				})
			);
		}
	}
}
