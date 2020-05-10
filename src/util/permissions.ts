import {GuildMember} from 'discord.js';

/**
 * Check if `user` can manage the `target`.
 *
 * @param user User who will be performing a moderation action
 * @param target The member who is being checked as manageable
 * @see https://discord.js.org/#/docs/main/master/class/GuildMember?scrollTo=manageable Discord.js docs on `GuildMember.manageable`
 */
export function manageable(user: GuildMember, target: GuildMember): boolean {
	return (
		target.user.id === user.guild.ownerID ||
		target.user.id === user.user.id ||
		user.user.id !== user.guild.ownerID ||
		user.roles.highest.comparePositionTo(target.roles.highest) > 0
	);
}
