import {
    INumeric,
} from "../types/utilities";

/**
 * Converts the given number to its positive integer.
 *
 * @param number Either a string or a number that should be converted.
 * @returns A positive integer, or `NaN` if `number` can't be converted.
 */
export function toPosInt(number: INumeric) {
    return Math.floor(Math.abs(Number(number)));
}

/**
 * Executes a handler a set number of times. The number of times is converted
 * into a positive integer (see {@link toPosInt}) and returned. The handler is
 * passed the current index and the maximum number of times that the handler
 * will be called.
 *
 * @param number Either a string or a number denoting how many times to execute
 *        `handler`.
 * @param handler A handler to execute `number` number of times.
 * @returns The number of times that `handler` was executed.
 */
export function times(
    number: INumeric,
    handler: (index?: number, max?: number) => void,
) {

    const max = toPosInt(number) || 0;
    let index = 0;

    while (index < max) {

        handler(index, max);
        index += 1;

    }

    return max;

}
