/**
 * Creates an array that's a shuffled version of the given array. The original
 * array is not modified. (Schwartzian transform)
 */
export function shuffle<T extends any>(array: T[]) {

    const numbers = window.crypto.getRandomValues(
        new Uint16Array(array.length)
    );

    return Array.from(array, (value, i) => ({
            value,
            sort: numbers[i]
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

}
