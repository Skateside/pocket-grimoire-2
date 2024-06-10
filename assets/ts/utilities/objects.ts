import {
    IObjectDiff,
    IObjectDiffEntry,
} from "../types/utilities";

export function matches(
    check: Record<PropertyKey, any> | null,
    source: Record<PropertyKey, any> | null,
): boolean {

    if (!check || !source) {
        return (!check && !source);
    }

    return Object.entries(check).every(([key, value]) => source[key] === value);

}

export function deepClone<T extends Record<PropertyKey, any>>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

export function isPrimative(object: unknown): boolean {

    const type = typeof object;

    return (
        object === undefined
        || object === null
        || ["boolean", "number", "string"].includes(type)
    );

}

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

export function empty(object: Record<PropertyKey, any>) {
    Object.keys(object).forEach((key) => delete object[key]);
    return object;
}

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
