import {MessageEmbed, Snowflake, TextChannel, Util, VoiceState} from 'discord.js';
import {Colors, Notifications} from '../../constants';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {channelCanBeNotified} from '../../util/notifications';

export default class VoiceStateUpdateListener extends DiceListener {
	public constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate',
			category: DiceListenerCategories.Client
		});
	}

	public static async generateNotification(oldState: VoiceState, newState: VoiceState): Promise<MessageEmbed | null> {
		// Fetch the member if they aren't in the cache
		const member = newState.member ?? (await newState.guild.members.fetch(newState.id));

		const {user} = member;

		const embed = new MessageEmbed({
			timestamp: new Date(),
			author: {
				name: `${user.tag} (${newState.id})`,
				iconURL: user.displayAvatarURL({size: 128})
			}
		});

		if (oldState.channel && newState.channel && oldState.channel !== newState.channel) {
			// Moving from one voice channel to another
			embed
				.setTitle('Switched voice channels')
				.setColor(Colors.Warning)
				.addField('Old voice channel', Util.escapeMarkdown(oldState.channel.name), true)
				.addField('New voice channel', Util.escapeMarkdown(newState.channel.name), true)
				.setThumbnail('https://dice.js.org/images/statuses/voiceChannel/transfer.png');
			return embed;
		}

		if (newState.channel && newState.channel !== oldState.channel) {
			// Connected to a voice channel
			embed
				.setTitle('Connected to a voice channel')
				.setColor(Colors.Success)
				.addField('Voice channel', Util.escapeMarkdown(newState.channel.name))
				.setThumbnail('https://dice.js.org/images/statuses/voiceChannel/join.png');
			return embed;
		}

		if (oldState.channel && newState.channel !== oldState.channel) {
			// Disconnected from a voice channel
			embed
				.setTitle('Disconnected from a voice channel')
				.setColor(Colors.Error)
				.addField('Voice channel', Util.escapeMarkdown(oldState.channel.name))
				.setThumbnail('https://dice.js.org/images/statuses/voiceChannel/leave.png');

			return embed;
		}

		// Why do we individually return an embed in each branch and return null here?
		// There is a scenario where someone is dragged from channel A -> channel A
		// This behavior is intentionally not handled here, hence returning null
		return null;
	}

	public async exec(oldState: VoiceState, newState: VoiceState): Promise<void> {
		const guildSettings = await this.client.prisma.guild.findUnique({
			where: {id: newState.guild.id},
			select: {notifications: {select: {channels: true}, where: {id: Notifications.VoiceChannel}}}
		});

		if (guildSettings?.notifications?.length) {
			// This array will be a single element since we are filtering by notification ID above
			const [setting] = guildSettings.notifications;

			const embed = await VoiceStateUpdateListener.generateNotification(oldState, newState);

			if (!embed) {
				return;
			}

			await Promise.all(
				setting.channels.map(async channelID => {
					if (await channelCanBeNotified(Notifications.VoiceChannel, newState.guild, channelID)) {
						const channel = this.client.channels.cache.get(channelID) as TextChannel;

						await channel.send(embed);
					}
				})
			);
		}
	}
}
