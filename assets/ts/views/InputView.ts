import View from "./View";
import {
    IFieldElement,
} from "../types/utilities";
import {
    announceInput,
} from "../utilities/dom";

export default class InputView extends View<{
    "input-update": Record<string, string | boolean>,
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

    static serialise(input: IFieldElement): Record<string, string | boolean> {

        const {
            name,
            type,
        } = input;
        const serialised = Object.create(null);

        if (!name || type === "file") {
            return serialised;
        }

        serialised[this.identify(input)] = this.getValue(input);

        return serialised;

    }

    watchInputs() {

        const constructor = this.constructor as typeof InputView;

        document.body.addEventListener("input", ({ target }) => {

            const input = (target as HTMLElement)
                .closest<IFieldElement>("input,select,textarea");

            if (input && !input.hasAttribute("data-no-store")) {
console.log('this.trigger("input-update", %o)', constructor.serialise(input));
                this.trigger("input-update", constructor.serialise(input));
            }

        });

    }

    populate(data: Record<string, string | boolean>) {

        Object.entries(data).forEach(([selector, value]) => {

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

}
