import {bold} from 'discord-md-tags';
import {Message, Permissions, Role} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {nullish} from '../../util/filters';
import {clean} from '../../util/format';
import {cleanDeletedSelfRoles} from '../../util/self-roles';

export default class GetSelfRoleCommand extends DiceCommand {
	constructor() {
		super('get-self-role', {
			aliases: ['self-role-get', 'self-roles-get', 'get-self-roles'],
			description: {content: 'Give yourself a selfrole.', usage: '<role>', examples: ['@Updates", "Artists']},
			category: DiceCommandCategories.Selfroles,
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			args: [
				{id: 'role', type: AkairoArgumentType.Role, prompt: {retry: 'Invalid role provided, please try again', start: 'What selfrole would you like to get?'}}
			]
		});
	}

	async exec(message: Message, args: {role: Role}): Promise<Message | undefined> {
		if (message.member!.roles.cache.has(args.role.id)) {
			return message.util?.send('You already have that role');
		}

		const guild = await this.client.prisma.guild.findUnique({where: {id: message.guild!.id}, select: {selfRoles: true}});
		const selfRoles = new Set(guild?.selfRoles);

		if (!nullish(guild) && selfRoles.size > 0) {
			const validatedSelfroles = await cleanDeletedSelfRoles(this.client.prisma, [...selfRoles], message.guild!);

			if (validatedSelfroles.length === 0) {
				// The selfroles list from the DB consisted entirely of invalid roles
				return message.util?.send('No selfroles');
			}

			if (selfRoles.has(args.role.id)) {
				try {
					await message.member!.roles.add(args.role.id, 'Selfrole');
				} catch {
					// eslint-disable-next-line no-return-await
					return await message.util?.send('Unable to give you that role');
				}

				return message.util?.send(`You were given the ${bold`${clean(args.role.name, message)}`} role`);
			}

			return message.util?.send("That role isn't a selfrole");
		}

		return message.util?.send('No selfroles');
	}
}
