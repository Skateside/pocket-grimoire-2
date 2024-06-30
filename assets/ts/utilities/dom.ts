import {
    IFieldElement,
} from "../types/utilities";
import {
    memoise,
} from "./functions";
import {
    randomId,
} from "./strings";

export function identify(element: Element | null, prefix = "anonymous-") {

    if (!element) {
        return "";
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

    if (!input || !(/^input|select|textarea$/i).test(input.nodeName)) {
        return;
    }

    input.dispatchEvent(new Event("input", {
        bubbles: true,
    }));
    input.dispatchEvent(new Event("change", {
        bubbles: true,
    }));

}
