import {
    random,
} from "./numbers";

/**
 * Creates an array that's a shuffled version of the given array. The original
 * array is not modified. The shuffling is cryptographically random.
 *
 * @param array Array to shuffle.
 * @returns Shuffled array.
 */
export function shuffle<T extends any>(array: T[]) {

    // Fisher-Yates algorithm

    const clone = [...array];
    let { length } = clone;

    while (length > 1) {
        length -= 1;
        const index = Math.floor(random() * length);
        [clone[index], clone[length]] = [clone[length], clone[index]];
    }

    return clone;

}

/**
 * Replaces the contents of the given array with the given contents.
 *
 * @param array Array whose contents should be replaced.
 * @param contents Replacement contents.
 * @returns Updated array.
 *
 * @example
 * const array = [1, 2, 3];
 * const replaced = replace(array, [4, 5, 6]);
 * array; // [4, 5, 6]
 * array === replaced; // true
 */
export function replace<T extends any>(array: T[], contents: T[]) {

    array.length = 0;
    array.push(...contents);

    return array;

}

/**
 * Removes all the duplicates from the given array.
 *
 * @param array Array whose duplicate entries should be removed.
 * @returns De-duplicated array.
 */
export function unique<T extends any>(array: T[]) {
    return [...new Set<T>(array)];
}
