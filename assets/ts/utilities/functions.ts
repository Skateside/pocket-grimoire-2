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
