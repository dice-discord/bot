import {Message, Permissions} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {crafatarArgs, downloadImage, genericErrorMessage} from '../../util/crafatar';
import {MinecraftAccount} from '../../util/player-db';

export default class capeCommand extends DiceCommand {
	constructor() {
		super('cape', {
			aliases: ['get-cape', 'get-mc-cape', 'get-minecraft-cape', 'mc-cape', 'minecraft-cape'],
			description: {
				content: "Get a Minecraft user's cape (via Crafatar).",
				usage: '<player>',
				examples: ['notch']
			},
			category: DiceCommandCategories.Minecraft,
			clientPermissions: [Permissions.FLAGS.ATTACH_FILES],
			typing: true,
			args: [crafatarArgs.player]
		});
	}

	async exec(message: Message, args: {player: MinecraftAccount}): Promise<Message | undefined> {
		let image: Buffer;

		try {
			image = await downloadImage({imageType: 'cape', playerUUID: args.player.id});
		} catch (error) {
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
