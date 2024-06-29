import {
    IQuerySelectorOptions,
    IDomLookupCache,
    IFieldElement,
} from "../types/utilities";
import {
    memoise,
} from "./functions";
import {
    randomId,
} from "./strings";

// TODO: When we remove `querySelector()` and `querySelectorCached()`, get rid
// of the option for `element` to be Document here.
export function identify(
    element: Element | Document | null,
    prefix = "anonymous-"
) {

    if (!element) {
        return "";
    }

    if (element === document) {
        return "_document_";
    }

    element = element as HTMLElement;
    let {
        id,
    } = element;

    if (!id) {

        do {
            id = randomId(prefix);
        } while (document.getElementById(id));

        element.id = id;

    }

    return id;

}

/** @deprecated use {@link findOrDie} instead */
// TODO: When this is removed, update `idenify()`
export function querySelector<T extends HTMLElement>(
    selector: string,
    options: IQuerySelectorOptions = {}
) {

    const root = (
        Object.hasOwn(options, "root")
        ? options.root
        : document
    );

    if (!root) {
        throw new TypeError("Cannot look up element - root is missing");
    }

    const element = root.querySelector<T>(selector);

    if (options.required && !element) {

        throw new ReferenceError(
            `Cannot find an element matching selector "${selector}"`
        );

    }

    return element;

}

/** @deprecated use {@link findOrDie} instead and save the result */
export const querySelectorCached = memoise(
    querySelector,
    (selector, options) => `#${identify(options?.root || null)} ${selector}`
);

export function findOrDie<T extends HTMLElement>(
    selector: string,
    root: HTMLElement | Document | null = document,
) {

    if (!root) {
        throw new TypeError("Cannot look up element - root is missing");
    }

    const element = root.querySelector<T>(selector);

    if (!element) {

        throw new ReferenceError(
            `Cannot find element matching selector "${selector}"`
        );

    }

    return element;

}

export const findOrDieCached = memoise(findOrDie);

export function updateChildren(
    content: HTMLElement | DocumentFragment,
    updates: Record<string, (element: HTMLElement) => void>
) {

    Object.entries(updates).forEach(([selector, updater]) => {

        content.querySelectorAll<HTMLElement>(selector).forEach((element) => {
            updater(element);
        });

    });

}

export function renderTemplate(
    selector: string,
    populates: Record<string, (element: HTMLElement) => void>
): DocumentFragment {

    const template = findOrDieCached<HTMLTemplateElement>(selector);
    const clone = template.content.cloneNode(true) as DocumentFragment;

    updateChildren(clone, populates);

    return clone;

}

export function serialiseForm(form: HTMLFormElement): Record<string, any> {

    const formData = new FormData(form);
    const data = Object.create(null);
    const keyed = /(\w+)\[(\w+)]/;

    for (let [key, value] of formData) {

        const matches = key.match(keyed);

        if (matches?.length) {

            if (!Object.hasOwn(data, matches[1])) {
                data[matches[1]] = Object.create(null);
            }

            data[matches[1]][matches[2]] = value;

        } else {
            data[key] = value;
        }

    }

    return data;

}

/**
 * Triggers the appropriate events for an input having changed, in the correct
 * (or, at least, a consistent) order. If the given input does not exist or is
 * not an input then nothing happens.
 */
export function announceInput(input: IFieldElement) {

    input.dispatchEvent(new Event("input", {
        bubbles: true,
    }));
    input.dispatchEvent(new Event("change", {
        bubbles: true,
    }));

}

export function makeLookupCache<T extends HTMLElement = HTMLElement>(lookup: IDomLookupCache<T>) {

    const cache = new WeakMap<HTMLElement, T>();

    return (element: HTMLElement): T => {

        let value = cache.get(element);

        if (value === undefined) {

            value = lookup(element) as T;
            cache.set(element, value);

        }

        return value;

    };

}
