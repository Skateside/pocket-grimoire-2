import {
    IObjectDiff,
    // IObjectDiffEntry,
} from "../types/utilities";

/**
 * Checks to see if every entry in `check` also appears in `source`. Be warned
 * that every entry in `source` does not need to be in `check` for this function
 * to return `true`.
 *
 * @param check Checks for the source.
 * @param source Source that should contain `check`.
 * @returns `true` if `source` contains all of `check`, false if it doesn't.
 *
 * @example
 * const check = { one: 1, two: "2" };
 * const source = { one: 1, two: "2", three: 3 };
 * matches(check, source); // true
 * matches(source, check); // false
 */
export function matches(
    check: Record<PropertyKey, any> | null,
    source: Record<PropertyKey, any> | null,
): boolean {

    if (!check || !source) {
        return (!check && !source);
    }

    return Object.entries(check).every(([key, value]) => source[key] === value);

}

/**
 * Clones the given object and returns that copy. Mutating the copy will not
 * affect the original.
 *
 * @param object Object to clone.
 * @returns Cloned object.
 */
export function deepClone<T extends Record<PropertyKey, any>>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Checks to see if the given object is a string, number, boolean, `null`, or
 * `undefined`.
 *
 * @param object Object to check.
 * @returns `true` if `object` is a string, number, boolean, `null`, or
 * `undefined`, `false` otherwise.
 */
export function isPrimative(object: unknown) {

    const type = typeof object;

    return (
        object === undefined
        || object === null
        || ["boolean", "number", "string"].includes(type)
    );

}

/**
 * Gets the difference between the two given objects.
 *
 * @param source Source object to check.
 * @param update Update to the source object.
 * @returns Information about the differences.
 *
 * @example
 * const source = { one: 1, two: 2 };
 * const update = { two: "2", three: 3 };
 * diff(source, update);
 * // {
 * //     one: { type: "remove" },
 * //     two: { type: "update": value: "2" },
 * //     three: { type: "new": value: 3 }
 * // }
 */
export function diff<T extends any = any>(
    source: Record<PropertyKey, any>,
    update: Record<PropertyKey, any>,
) {

    const diff: IObjectDiff<T> = Object.create(null);

    Object.keys(source).forEach((key) => {

        if (!Object.hasOwn(update, key)) {
            diff[key] = { type: "remove" };
            return;
        }

    });

    Object.entries(update).forEach(([key, value]) => {

        if (!Object.hasOwn(source, key)) {
            diff[key] =  { value, type: "new" };
            return;
        }

        const item = source[key];

        if (
            (
                isPrimative(item)
                && isPrimative(value)
                && item === value
            )
            || (
                typeof item === "object"
                && typeof value === "object"
                && matches(item, value)
                && matches(value, item)
            )
        ) {
            return;
        }

        diff[key] = { value, type: "update" };

    });

    return diff;

}

/**
 * Removes all the keys from the given object.
 *
 * @param object Object whose keys will be removed.
 * @returns Empty object.
 *
 * @example
 * const object = { one: 1 };
 * const emptied = empty(object);
 * object; // {}
 * emptied; // {}
 * object === emptied; // true
 */
export function empty(object: Record<PropertyKey, any>) {
    Object.keys(object).forEach((key) => delete object[key]);
    return object;
}

/**
 * Checks to see if the given object has any properties in it.
 *
 * @param object Object to check.
 * @returns `true` if the object has no entries, `false` if it has any.
 *
 * @example
 * isEmpty({}); // true
 * isEmpty({ one: 1 }); // false
 */
export function isEmpty(
    object: Record<PropertyKey, any>,
): object is Record<PropertyKey, never> {

    for (const property in object) {
        if (Object.hasOwn(object, property)) {
            return false;
        }
    }

    return true;

}

/**
 * Updates `source` based on the keys in `extend`. If the key in `extend` is
 * `undefined`, it is removed from `source`.
 *
 * @param source Source object to update.
 * @param extend Updates to apply.
 * @returns Modified source object.
 *
 * @example
 * const source = { one: 1, two: 2 }
 * const extend = { two: undefined, three: 3 }
 * update(source, extend);
 * source; // { one: 1, three: 3 }
 */
export function update<T extends Record<PropertyKey, any>>(
    source: T,
    extend: Record<PropertyKey, any>,
): T {

    Object
        .entries(extend)
        .forEach(<K extends keyof T>([key, value]: [K, T[K]]) => {

            if (value === undefined) {
                delete source[key];
            } else {
                source[key] = value;
            }

        });

    return source;

}
