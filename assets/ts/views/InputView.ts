import type {
    IInputRecord,
} from "../types/classes";
import type {
    IFieldElement,
} from "../types/utilities";
import View from "./View";
import {
    announceInput,
    optout,
    createInputWatcher,
    INPUT_WATCH_EVENT,
} from "../utilities/dom";
import {
    debounce,
} from "../utilities/functions";

const SELECTOR = "input:not([type=\"hidden\"]),select,textarea";

export default class InputView extends View<{
    "input-update": IInputRecord,
    "inputs-removed": void,
}> {

    static identify(input: IFieldElement) {

        const {
            name,
            form,
            type,
            value,
            nodeName
        } = input;

        let selector = `${nodeName.toLowerCase()}[name="${name}"]`;
        const isCheckbox = type === "checkbox";

        if (isCheckbox && input.hasAttribute("value")) {
            selector += `[value="${value}"]`;
        }

        const formId = form?.id;
        if (formId) {
            selector = `#${formId} ${selector}`;
        }

        return selector;

    }

    static getValue(input: IFieldElement) {

        return (
            input.type === "checkbox"
            ? (input as HTMLInputElement).checked
            : input.value
        );

    }

    static serialise(input: IFieldElement) {

        const {
            name,
            type,
        } = input;
        const serialised = Object.create(null) as IInputRecord;

        if (!name || type === "file") {
            return serialised;
        }

        serialised[this.identify(input)] = this.getValue(input);

        return serialised;

    }

    watchInputs() {

        const constructor = this.constructor as typeof InputView;
        const {
            body,
        } = document;

        body.addEventListener("input", ({ target }) => {

            this.updateInput(
                (target as HTMLElement).closest<IFieldElement>(SELECTOR)
            );

        });

        body.addEventListener(INPUT_WATCH_EVENT, ({ target }) => {

            this.updateInput(
                (target as HTMLElement).closest<IFieldElement>(SELECTOR)
            );

        });

        body.addEventListener("reset", ({ target }) => {

            const form = (target as HTMLElement).closest("form");

            if (!form) {
                return;
            }

            const remove = Object.create(null) as IInputRecord;

            form
                .querySelectorAll<IFieldElement>(SELECTOR)
                .forEach((field) => {
                    remove[constructor.identify(field)] = undefined;
                });

            this.trigger("input-update", remove);

        });

        this.createWatchers(body);

        const triggerInputsRemoved = debounce(() => {
            this.trigger("inputs-removed", null);
        });

        const observer = new MutationObserver((records) => {

            records.forEach(({ addedNodes, removedNodes }) => {

                addedNodes.forEach((node) => {

                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.createWatchers(node as HTMLElement);
                    }

                });

                if (removedNodes.length) {
                    triggerInputsRemoved();
                }

            });
        });
        observer.observe(body, {
            childList: true,
            subtree: true,
        });

    }

    updateInput(input: IFieldElement) {

        const constructor = this.constructor as typeof InputView;

        if (!optout(input, "store")) {
            this.trigger("input-update", constructor.serialise(input));
        }

    }

    createWatchers(element: HTMLElement) {

        element
            .querySelectorAll<IFieldElement>(SELECTOR)
            .forEach((input) => createInputWatcher(input));

    }

    populate(data: IInputRecord) {

        Object.entries(data).forEach(([selector, value]) => {

            if (value === undefined) {
                return;
            }

            const inputs = [
                ...document.querySelectorAll<IFieldElement>(selector)
            ];

            if (!inputs.length) {
                return;
            }

            const isRadio = inputs[0].type === "radio";
            const input = (
                isRadio
                ? inputs.find((input) => input.value === value)
                : inputs[0]
            );

            if (!input) {
                return;
            }

            if (isRadio) {
                (input as HTMLInputElement).checked = true;
            } else if (input.type === "checkbox") {
                (input as HTMLInputElement).checked = Boolean(value);
            } else {
                input.value = String(value);
            }

            announceInput(input);

        });

    }

    confirmData(data: IInputRecord) {

        const constructor = this.constructor as typeof InputView;
        const updated = Object.fromEntries(
            Object.keys(data).map((selector) => {

                const input = document.querySelector<IFieldElement>(selector);

                return [
                    selector,
                    (
                        input
                        ? constructor.getValue(input)
                        : undefined
                    )
                ];

            })
        );

        this.trigger("input-update", updated);

    }

}
