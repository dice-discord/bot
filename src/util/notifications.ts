import {PrismaClient} from '@prisma/client';
import assert from 'assert';
import {Guild, MessageEmbed, Permissions, Snowflake, TextChannel, User} from 'discord.js';
import {Notifications} from '../constants';
import {baseLogger} from '../logging/logger';
import {DiceClient} from '../structures/DiceClient';

const logger = baseLogger.scope('util', 'notifications');

export async function channelCanBeNotified(notification: Notifications, guild: Guild, channelID: Snowflake): Promise<boolean> {
	const channel = (await guild.client.channels.fetch(channelID)) as TextChannel | undefined;

	if (channel && !channel.deleted && guild.me && channel.viewable) {
		const permissions = channel.permissionsFor(guild.me);

		if (permissions?.has(Permissions.FLAGS.SEND_MESSAGES) && permissions.has(Permissions.FLAGS.EMBED_LINKS)) {
			// The channel exists, and we can write to it properly
			return true;
		}
	}

	// Get the current settings so we can remove the invalid channel ID
	const notificationSettings = await (guild.client as DiceClient).prisma.notificationSettings.findUnique({
		where: {id_guildId: {guildId: guild.id, id: notification}},
		select: {channels: true}
	});

	if (notificationSettings) {
		// Remove the channel we no longer have send permissions in
		notificationSettings.channels.splice(notificationSettings.channels.indexOf(channelID));

		// This update the array for the specified notification
		(guild.client as DiceClient).prisma.guild
			.update({
				where: {id: guild.id},
				data: {notifications: {update: {where: {id_guildId: {guildId: guild.id, id: notification}}, data: {channels: {set: notificationSettings.channels}}}}},
				select: {id: true}
			})
			// eslint-disable-next-line promise/prefer-await-to-then
			.catch(error => {
				logger.error(`Unable to remove the channel ${channelID} for ${notification} notifications while checking if it could be notified`, error);
			});
	}

	return false;
}

/**
 * Check if a notification is enabled in a text channel.
 *
 * @param prisma The Prisma instance to perform queries with
 * @param notification The notification to check
 * @param channel The text channel to check
 */
export async function isNotificationEnabledForChannel(prisma: PrismaClient, notification: Notifications, channel: TextChannel): Promise<boolean> {
	assert(channel.guild.me);

	const config = await prisma.notificationSettings.findUnique({where: {id_guildId: {guildId: channel.guild.id, id: notification}}, select: {channels: true}});

	if (config) {
		// This assumes that only one item will be in the array, because of the filter we did above

		if (config.channels.includes(channel.id)) {
			if (channel.permissionsFor(channel.guild.me)?.has(Permissions.FLAGS.SEND_MESSAGES)) {
				return true;
			}

			// Make a copy of the array
			const updatedChannels = [...config.channels];

			// Remove the channel we no longer have send permissions in
			updatedChannels.splice(updatedChannels.indexOf(channel.id));

			// This updates the array for the specified notification
			prisma.notificationSettings
				.update({where: {id_guildId: {guildId: channel.guild.id, id: notification}}, data: {channels: {set: updatedChannels}}})
				// eslint-disable-next-line promise/prefer-await-to-then
				.catch(error => {
					logger.error(`Unable to remove the channel ${channel.id} while checking if ${notification} notifications were enabled`, error);
				});

			return false;
		}

		return false;
	}

	return false;
}

/**
 * Creates an embed that notifies about a user's birthday.
 * @param user The user to generate the notification for
 */
export function generateUserBirthdayNotification(user: User): MessageEmbed {
	return new MessageEmbed({
		title: 'Discord Account Birthday',
		thumbnail: {
			url: 'https://dice.js.org/images/statuses/birthday/cake.png'
		},
		description: [
			`It's the Discord account birthday of ${user.tag}.`,
			`On this day in ${user.createdAt.getFullYear()} they created their Discord account.`
		].join('\n'),
		timestamp: new Date(),
		author: {
			name: `${user.tag} (${user.id})`,
			iconURL: user.displayAvatarURL({size: 128})
		}
	});
}

/**
 * Check if a user account had their birthday today
 * @param today The date to use to compare users' birthdays
 * @param user The user to check
 * @returns Whether or not the user's birthday is today
 */
export function todayIsUsersBirthday(today: Date, user: User): boolean {
	return user.createdAt.getDate() === today.getDate() && user.createdAt.getMonth() === today.getMonth() && user.createdAt.getFullYear() !== today.getFullYear();
}
