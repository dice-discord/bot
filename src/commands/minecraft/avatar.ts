import {Message, Permissions} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {Size} from '../../types/crafatar';
import {crafatarArgs, downloadImage, genericErrorMessage} from '../../util/crafatar';
import {MinecraftAccount} from '../../util/player-db';

export default class AvatarCommand extends DiceCommand {
	constructor() {
		super('avatar', {
			aliases: ['get-face', 'get-mc-face', 'get-minecraft-face', 'mc-avatar', 'minecraft-avatar'],
			description: {
				content: 'Get an avatar image of a Minecraft user (via Crafatar).',
				usage: '<player> [size:<size>] [--overlay]',
				examples: ['notch', 'notch size:200', 'notch --overlay', 'notch size:32 --overlay']
			},
			category: DiceCommandCategories.Minecraft,
			clientPermissions: [Permissions.FLAGS.ATTACH_FILES],
			typing: true,
			args: [crafatarArgs.player, crafatarArgs.size, crafatarArgs.overlay]
		});
	}

	async exec(message: Message, args: {player: MinecraftAccount; overlay: boolean | null; size: Size | null}): Promise<Message | undefined> {
		let image: Buffer;

		try {
			image = await downloadImage({imageType: 'avatar', playerUUID: args.player.id, size: args.size ?? undefined, overlay: args.overlay ?? false});
		} catch (error: unknown) {
			this.logger.error(error);

			// eslint-disable-next-line no-return-await
			return await message.util?.send(genericErrorMessage);
		}

		if (image) {
			return message.util?.send({files: [image]});
		}

		return message.util?.send([genericErrorMessage, 'No image was found'].join('\n'));
	}
}
