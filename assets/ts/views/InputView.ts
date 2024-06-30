import type {
    IInputRecord,
} from "../types/classes";
import type {
    IFieldElement,
} from "../types/utilities";
import View from "./View";
import {
    announceInput,
} from "../utilities/dom";

export default class InputView extends View<{
    "input-update": IInputRecord,
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

            const input = (target as HTMLElement)
                .closest<IFieldElement>("input,select,textarea");

            if (input && !input.hasAttribute("data-no-store")) {
                this.trigger("input-update", constructor.serialise(input));
            }

        });

        body.addEventListener("reset", ({ target }) => {

            const form = (target as HTMLElement).closest("form");

            if (!form) {
                return;
            }

            const remove = Object.create(null) as IInputRecord;

            form
                .querySelectorAll<IFieldElement>("input,select,textarea")
                .forEach((field) => {
                    remove[constructor.identify(field)] = undefined;
                });

            this.trigger("input-update", remove);

        });

    }

    populate(data: IInputRecord) {

        const forms = new Set<HTMLFormElement>();

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

            if (input.form) {
                forms.add(input.form);
            }

        });

        forms.forEach((form) => {
            form.requestSubmit();
        });

    }

}
