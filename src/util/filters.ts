type Nullish = null | undefined;

const nullishItems: Set<Nullish | unknown> = new Set([null, undefined]);

/**
 * Check if something is `null` or `undefined`.
 * @param thing Thing to check
 */
export function nullish(thing: unknown): thing is Nullish {
	return nullishItems.has(thing);
}
