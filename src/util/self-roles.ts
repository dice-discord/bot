import {Snowflake, Guild} from 'discord.js';
import {PrismaClient} from '@prisma/client';

/**
 * Removes self roles that are for roles that have been deleted on a Discord guild.
 *
 * @param selfRoles Array of role IDs that are self roles
 * @param guild The guild for these self roles
 * @returns An array of IDs for self roles that stll exist in the guild
 */
export async function cleanDeletedSelfRoles(prisma: PrismaClient, selfRoles: Snowflake[], guild: Guild): Promise<Snowflake[]> {
	const copy = [...selfRoles];

	/** Selfroles that have been deleted from Discord. */
	const deletedRoles = selfRoles.filter(id => !guild.roles.cache.has(id));

	// Delete the old roles from the validated list
	for (const deletedRole of deletedRoles) {
		copy.splice(selfRoles.indexOf(deletedRole));
	}

	if (copy.length !== selfRoles.length) {
		// If something changed during the validation phase
		await prisma.guild.update({where: {id: guild.id}, data: {selfRoles: {set: copy}}});
	}

	return copy;
}
