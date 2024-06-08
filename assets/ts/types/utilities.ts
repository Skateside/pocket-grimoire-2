export type INumeric = number | `${number}`;

export type IObjectDiff<T extends any = any> = Record<string, {
    value: T,
    type: "new" | "update",
} | {
    type: "remove",
}>;

// -- Deprecated after this ------------------------------------------------- //

/** @deprecated */
export type IQuerySelectorOptions = Partial<{
    required: boolean,
    root: HTMLElement | Document | null,
}>;

// A Promise variant that can be resolved externally.
/** @deprecated */
export type IDefer<T extends any = any> = Promise<T> & {
    resolve(value: T | PromiseLike<T>): void,
    reject(reason?: any): void,
};

/** @deprecated */
export type IDomLookupCache<T extends HTMLElement = HTMLElement> = (element: HTMLElement) => T;

/** @deprecated */
export type IStorage = {
    // lookup: Record<string, any>,
    repository: Record<string, any>[],
};
