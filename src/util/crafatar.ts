import {Argument, ArgumentOptions} from 'discord-akairo';
import got, {CancelableRequest} from 'got';
import {PackageJson} from 'type-fest';
import * as pkg from '../../package.json';
import {typeName as minecraftUser} from '../types/minecraftUser';
import {AkairoArgumentType} from '../structures/DiceCommand';
import {Scale, Size} from '../types/crafatar';

/** Base URL for API requests. */
const baseURL = 'https://crafatar.com';

/**
 * Options for an image from Crafatar.
 */
interface AllCrafatarOptions {
	/** The size for the avatar in pixels. */
	size: Size;
	/** The scale factor for renders. */
	scale: Scale;
	/** Apply the overlay to the avatar. */
	overlay: boolean;
	/** The fallback to be used when the requested image cannot be served. */
	default: string;
}

/** Base options that all options have. */
interface BaseOptions extends Pick<AllCrafatarOptions, 'default'> {
	/** A Minecraft player UUID. */
	playerUUID: string;
}

type CrafatarImageType = 'avatar' | 'cape' | 'head' | 'body' | 'skin';

type CrafatarAvatarOptions = BaseOptions & {imageType: 'avatar'} & Pick<AllCrafatarOptions, 'size' | 'overlay'>;
type CrafatarHeadOptions = BaseOptions & {imageType: 'head'} & Pick<AllCrafatarOptions, 'scale' | 'overlay'>;
type CrafatarBodyOptions = BaseOptions & {imageType: 'body'} & Pick<AllCrafatarOptions, 'scale' | 'overlay'>;
type CrafatarSkinOptions = BaseOptions & {imageType: 'skin'};
type CrafatarCapeOptions = BaseOptions & {imageType: 'cape'};

type CrafatarOptions = CrafatarAvatarOptions | CrafatarHeadOptions | CrafatarBodyOptions | CrafatarSkinOptions | CrafatarCapeOptions;

/** Converts our image types into the API subpath for that image. */
const subpaths: Record<CrafatarImageType, string> = {
	avatar: 'avatars',
	head: 'renders/head',
	body: 'renders/body',
	skin: 'skins',
	cape: 'capes'
};

const {version} = pkg as PackageJson;

/**
 * Download an image from Crafatar.
 * @param options Options to use with Crafatar
 */
export function downloadImage(options: Partial<CrafatarOptions> & Pick<CrafatarOptions, 'imageType' | 'playerUUID'>): CancelableRequest<Buffer> {
	const searchParameters = new URLSearchParams();

	const endpoint = subpaths[options.imageType];

	if ((options.imageType === 'body' || options.imageType === 'head') && options.scale) {
		searchParameters.append('scale', options.scale.toString());
	}

	if ((options.imageType === 'avatar' || options.imageType === 'head' || options.imageType === 'body') && options.overlay) {
		searchParameters.append('overlay', '');
	}

	if (options.imageType === 'avatar' && options.size) {
		searchParameters.append('size', options.size.toString());
	}

	if (options.default !== undefined) {
		searchParameters.append('default', options.default);
	}

	const request = got(`${baseURL}/${endpoint}/${options.playerUUID}`, {
		headers: {'User-Agent': `Dice Discord bot / v${version ?? '0.0.0-development'} dice.js.org`}
	});

	return request.buffer();
}

/** Args to use in Crafatar or other Minecraft commands. */
export const crafatarArgs: Record<'player' | 'size' | 'overlay' | 'scale', ArgumentOptions> = {
	player: {
		id: 'player',
		type: minecraftUser,
		match: 'content',
		prompt: {start: 'What Minecraft player (UUID or username) do you want to get the avatar for?', retry: 'Invalid player provided, please try again'}
	},
	size: {
		id: 'size',
		type: Argument.range(AkairoArgumentType.Integer, 1, 512),
		match: 'option',
		flag: 'size:',
		prompt: {retry: 'Invalid size provided, please provide the number of pixels from 1-512', optional: true},
		default: null
	},
	overlay: {
		id: 'overlay',
		match: 'flag',
		flag: '--overlay',
		prompt: {optional: true},
		default: null
	},
	scale: {
		id: 'scale',
		type: Argument.range(AkairoArgumentType.Integer, 1, 10),
		match: 'option',
		flag: 'scale:',
		prompt: {retry: 'Invalid scale value provided, please provide a whole number from 1-10', optional: true},
		default: null
	}
};

/** A generic error message for a failed request. */
export const genericErrorMessage = 'There was an error while downloading the image from Crafatar (https://crafatar.com)';
