type Nullish = null | undefined;

const nullishItems: Array<Nullish | unknown> = [null, undefined]

/**
 * Check if something is `null` or `undefined`.
 * @param thing Thing to check
 */
export function nullish(thing: unknown): thing is Nullish {
	return nullishItems.includes(thing);
}
