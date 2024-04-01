import { INumeric } from "../types/types";

/**
 * Converts the given number to its positive integer.
 */
export function toPosInt(number: INumeric) {
    return Math.floor(Math.abs(Number(number)));
}

/**
 * Executes a handler a set number of times. The number of times is converted
 * into a positive integer (see {@link toPosInt}) and returned. The handler is
 * passed the current index and the maximum number of times that the handler
 * will be called.
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