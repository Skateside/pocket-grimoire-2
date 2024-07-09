import {
    IFieldElement,
} from "../types/utilities";
import {
    memoise,
} from "./functions";
import {
    randomId,
    wordlist,
} from "./strings";

/**
 * Returns the ID of the given element. If the element doesn't have an ID, a
 * unique one is created and assigned before being returned.
 *
 * @param element Element that should be identified.
 * @param prefix Prefix for the generated ID. Defaults to `"anonymous-"`.
 * @returns Element's ID.
 *
 * @example
 * const div = document.querySelector("div");
 * div; // <div>Lorem ipsum</div>
 * const id = identify(div);
 * id; // "anonymous-0"
 * div; // <div id="anonymous-0">Lorem ipsum</div>
 */
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

/**
 * Finds the element which matches the given CSS selector, optionally limited to
 * being a child of the given `root`. If the element is not found, a
 * `ReferenceError` is thrown.
 *
 * @param selector CSS selector to identify the element.
 * @param root Optional root element. Defaults to `document`.
 * @returns The found element.
 */
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

/**
 * A cached version of {@link findOrDie}.
 *
 * @param selector CSS selector to identify the element.
 * @param root Optional root element. Defaults to `document`.
 * @returns The found element.
 */
export const findOrDieCached = memoise(findOrDie);

/**
 * Updates the given `content` element's children based on the given updates.
 * The updates are an object of a CSS selector to a function which takes a match
 * and performs an update.
 *
 * @param content Content element to update.
 * @param updates Updater functions.
 *
 * @example
 * const div = document.querySelector("div");
 * div;
 * // <div>
 * //     <span class="update-me">Alpha</span>
 * //     <em class="update-me">Bravo</em>
 * //     <span class="update-me-too">Charlie</span>
 * // </div>
 * updateChildren(div, {
 *     ".update-me"(element) {
 *         element.textContent = element.textContent.slice(0, 1);
 *     },
 *     ".update-me-too"(element) {
 *         element.textContent = element.textContent.slice(1);
 *     },
 * });
 * div;
 * // <div>
 * //     <span class="update-me">A</span>
 * //     <em class="update-me">B</em>
 * //     <span class="update-me-too">e</span>
 * // </div>
 */
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

/**
 * Renders the given template and populates its contents (see
 * {@link updateChildren}).
 *
 * @param selector CSS selector identifying the `<template>` element.
 * @param populates Updates for the template.
 * @returns A `DocumentFragment` containing the rendered template.
 */
export function renderTemplate(
    selector: string,
    populates: Record<string, (element: HTMLElement) => void>
) {

    const template = findOrDieCached<HTMLTemplateElement>(selector);
    const clone = template.content.cloneNode(true) as DocumentFragment;

    updateChildren(clone, populates);

    return clone;

}

/**
 * A variation of {@link renderTemplate} that takes a collection of items and
 * passes each one to the given `handler` to generate the `populates`.
 *
 * @param selector CSS selector identifying the `<template>` element.
 * @param collection Collection of items that will generate each template.
 * @param handler A function that takes each item in `collection` and creates
 *        the `populates` parameter for {@link renderTemplate}.
 * @returns A `DocumentFragment` containing the rendered templates.
 */
export function renderTemplateMany<T extends any = any>(
    selector: string,
    collection: T[],
    handler: (item: T, index: number) => Record<string, (element: HTMLElement) => void>,
) {

    return Array.prototype.reduce.call(
        collection,
        (fragment: DocumentFragment, item: T, index: number) => {

            fragment.append(renderTemplate(selector, handler(item, index)));

            return fragment;

        },
        document.createDocumentFragment(),
    );

}

/**
 * Serialises a form into an object of the form field names to their values.
 *
 * @param form Form element to serialise.
 * @returns Object containing the form field values.
 */
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
 *
 * @param input Input element that should have events triggered on it.
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

/**
 * Checks to see if the given element has opted-out of any of the given
 * features.
 *
 * @param element Element to check.
 * @param features Space-separated list of features to check for.
 * @returns `true` if the element has opted-out, `false` if it hasn't.
 *
 * @example
 * const div = document.querySelector("div");
 * div; // <div data-outout="one two three four five"></div>
 * optout(div, "one"); // true
 * optout(div, "two four"); // true
 * optout(div, "six"); // false
 * optout(div, "two six"); // false
 */
export function optout(element: HTMLElement, features: string) {

    const list = wordlist(element?.dataset.optout || "");
    const outs = wordlist(features);

    if (!list.length || !outs.length) {
        return false;
    }

    return outs.every((out) => list.includes(out));

}
