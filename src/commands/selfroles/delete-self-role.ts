import {bold} from 'discord-md-tags';
import {Message, Permissions, Role} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class DeleteSelfRoleCommand extends DiceCommand {
	constructor() {
		super('delete-self-role', {
			aliases: ['self-role-delete', 'self-roles-delete', 'delete-self-roles', 'del-self-roles', 'self-role-del', 'self-roles-del', 'del-self-role'],
			description: {content: "Remove a role from this server's selfroles.", usage: '<role>', examples: ['@Updates', 'Artists']},
			category: DiceCommandCategories.Selfroles,
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			args: [
				{
					id: 'role',
					type: AkairoArgumentType.Role,
					prompt: {retry: 'Invalid role provided, please try again', start: 'What selfrole would you like to remove?'}
				}
			]
		});
	}

	async exec(message: Message, args: {role: Role}): Promise<Message | undefined> {
		const guild = await this.client.prisma.guild.findUnique({where: {id: message.guild!.id}, select: {selfRoles: true}});
		const selfRoles = new Set(guild?.selfRoles);

		if (!selfRoles.has(args.role.id)) {
			return message.util?.send("That role isn't a selfrole");
		}

		if (message.member!.roles.highest.comparePositionTo(args.role) <= 0 && !message.member!.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
			return message.reply("You don't have the permissions to delete that role");
		}

		selfRoles.delete(args.role.id);

		await this.client.prisma.guild.update({where: {id: message.guild!.id}, data: {selfRoles: {set: [...selfRoles]}}});

		return message.util?.send(`Removed ${bold`${clean(args.role.name, message)}`} from the selfroles`);
	}
}
