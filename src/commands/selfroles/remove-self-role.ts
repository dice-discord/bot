import {bold} from 'discord-md-tags';
import {Message, Permissions, Role} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class GetSelfRoleCommand extends DiceCommand {
	constructor() {
		super('remove-self-role', {
			aliases: ['self-role-remove', 'self-roles-remove', 'get-self-remove'],
			description: {content: 'Remove a selfrole from yourself.', usage: '<role>', examples: ['@Updates", "Artists']},
			category: DiceCommandCategories.Selfroles,
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			args: [
				{
					id: 'role',
					type: AkairoArgumentType.Role,
					prompt: {retry: 'Invalid role provided, please try again', start: 'What selfrole would you like to remove from yourself?'}
				}
			]
		});
	}

	async exec(message: Message, args: {role: Role}): Promise<Message | undefined> {
		if (!message.member!.roles.cache.has(args.role.id)) {
			return message.util?.send("You don't have that role");
		}

		const guild = await this.client.prisma.guild.findOne({where: {id: message.guild!.id}, select: {selfRoles: true}});
		const selfRoles = new Set(guild?.selfRoles);

		if (!selfRoles.has(args.role.id)) {
			return message.util?.send("That role isn't a selfrole");
		}

		try {
			await message.member!.roles.remove(args.role.id, 'Selfrole');

			return await message.util?.send(`You no longer have the ${bold`${clean(args.role.name, message)}`} role`);
		} catch {
			// eslint-disable-next-line no-return-await
			return await message.util?.send('Unable to remove that role from you');
		}
	}
}
