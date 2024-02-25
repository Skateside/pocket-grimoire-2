import { IQuerySelectorOptions } from "../types/types";
import { memoise } from "./functions";

let identifyCounter = 0;

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

            id = `${prefix}${identifyCounter}`;
            identifyCounter += 1;

        } while (document.getElementById(id));

        element.id = id;

    }

    return id;

}

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

export const querySelectorCached = memoise(
    querySelector,
    (selector, options) => `#${identify(options?.root || null)} ${selector}`
);

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

    const template = querySelectorCached<HTMLTemplateElement>(selector, {
        required: true
    })!;
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
