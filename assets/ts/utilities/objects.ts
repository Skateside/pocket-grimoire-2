import { IObjectDiff } from "../types/types";

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

export function diff(
    source: Record<PropertyKey, any>,
    update: Record<PropertyKey, any>,
) {

    const diff: IObjectDiff = Object.create(null);

    Object.keys(source).forEach((key) => {

        if (!Object.hasOwn(update, key)) {
            diff[key] = { type: "remove" };
            return;
        }

    });

    Object.entries(update).forEach(([key, value]) => {

        if (!Object.hasOwn(source, key)) {
            diff[key] = { value, type: "new" };
            return;
        }

        if (source[key] !== value) {
            diff[key] = { value, type: "update" };
            return;
        }

    });

    return diff;

}

export function isEmpty(object: Record<PropertyKey, any>): object is Record<PropertyKey, never> {

    for (const property in object) {
        if (Object.hasOwn(object, property)) {
            return false;
        }
    }

    return true;

}
