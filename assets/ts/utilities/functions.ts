/**
 * Converts `handler` into a version of it that gets the results from a cache
 * rather then executing `handler` multiple times. The key in the cache has to
 * be a string, so `keymaker` takes the parameters from `handler` and makes a
 * string out of them.
 *
 * @param handler Function to memoise.
 * @param keymaker An optional function that creates a string from the
 *        parameters given to `handler`. Defaults to a function that returns a
 *        string of the first parameter.
 * @returns A function that will get cached results rather than executing
 *          `handler` multiple times.
 */
export function memoise<R, T extends (...args: any[]) => R>(
    handler: T,
    keymaker = (...args: Parameters<T>) => String(args[0]),
): T {

    const cache: Record<string, R> = Object.create(null);
    const func = (...args: Parameters<T>) => {

        const key = keymaker(...args);

        if (!Object.hasOwn(cache, key)) {
            cache[key] = handler(...args);
        }

        return cache[key];

    };

    return func as T;

}

/**
 * Debounces a function so that it will only execute when it hasn't been called
 * for the number of milliseconds specified in `delay`.
 *
 * @param handler Function to debounce.
 * @param delay Optional delay time in milliseconds. Defaults to 500.
 * @returns Debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(
    handler: T,
    delay = 500,
) {

    let timeoutId = 0;

    const debounced = (...args: Parameters<T>) => {

        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => handler(...args), delay);

    };

    return debounced as T;

}

/**
 * A function that takes no arguments and returns nothing.
 */
export function noop(...ignore: any[]) {
    return;
}
