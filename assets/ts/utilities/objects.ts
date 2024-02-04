export function matches(
    check: Record<PropertyKey, any> | null,
    source: Record<PropertyKey, any> | null
): boolean {

    if (!check || !source) {
        return (!check && !source);
    }

    return Object.entries(check).every(([key, value]) => source[key] === value);

}

export function deepClone<T extends Record<PropertyKey, any>>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}
