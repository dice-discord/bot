import {bold} from 'discord-md-tags';
import {Message, Permissions, Role, Util} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class AddSelfroleCommand extends DiceCommand {
	constructor() {
		super('add-self-role', {
			aliases: ['self-role-add', 'self-roles-add', 'add-self-roles'],
			description: {content: "Add a role to a server's selfroles.", usage: '<role>', examples: ['@Updates', 'Artists']},
			category: DiceCommandCategories.Selfroles,
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			args: [
				{id: 'role', type: AkairoArgumentType.Role, prompt: {retry: 'Invalid role provided, please try again', start: 'What selfrole would you like to add?'}}
			]
		});
	}

	async exec(message: Message, args: {role: Role}): Promise<Message | undefined> {
		if (message.guild!.id === args.role.id) {
			return message.util?.send(`You can't add ${Util.cleanContent('@everyone', message)} as a selfrole`);
		}

		const guild = await this.client.prisma.guild.findOne({where: {id: message.guild!.id}, select: {selfRoles: true}});

		const selfRoles = new Set(guild?.selfRoles);

		// Check if the role is already a self role
		if (selfRoles.has(args.role.id)) {
			return message.util?.send('That role is already a selfrole');
		}

		// Check if the author is able to add the role
		if (args.role.comparePositionTo(message.member!.roles.highest) >= 0 && !message.member!.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
			return message.reply("You don't have the permissions to add that role");
		}

		// Check if bot is able to add that role
		if (args.role.comparePositionTo(message.guild!.me!.roles.highest) >= 0) {
			return message.reply("I don't have the permissions to add that role");
		}

		// Check if role is managed by an integration
		if (args.role.managed) {
			return message.reply('An integration is managing that role');
		}

		await this.client.prisma.guild.upsert({
			where: {id: message.guild!.id},
			create: {id: message.guild!.id, selfRoles: {set: [args.role.id]}},
			update: {selfRoles: {set: [...selfRoles, args.role.id]}}
		});

		return message.util?.send(`Added ${bold`${clean(args.role.name, message)}`} to the selfroles`);
	}
}
