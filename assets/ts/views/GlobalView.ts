import View from "./View";
import {
    // IDomLookupCache,
} from "../types/utilities";
import {
    // makeLookupCache,
} from "../utilities/dom";

/** @deprecated */
export default class GlobalView extends View {

    // protected getOutputFromRange: IDomLookupCache<HTMLOutputElement>;

    constructor() {

        super();

        // this.getOutputFromRange = makeLookupCache(({ dataset: { output } }) => {
        //     return document.querySelector<HTMLOutputElement>(output);
        // });

    }

    static getDialog(selector: string) {

        const dialog = document.querySelector<HTMLDialogElement>(selector);

        if (!dialog) {
            console.warn(`Unable to find the dialog that matches '${selector}'`);
            return null;
        }

        if (!dialog.matches("dialog")) {
            console.warn(`Element that matches '${selector}' is not a <dialog>`);
            return null;
        }

        return dialog;

    }

    addListeners(): void {

        const constructor = this.constructor as typeof GlobalView;

        document.addEventListener("input", ({ target }) => {

            const htmlTarget = target as HTMLElement;

            if (htmlTarget.matches("input[type=\"range\"][data-output]")) {
                this.updateRangeOutput(htmlTarget as HTMLInputElement);
            }

        });

        document.addEventListener("click", ({ target }) => {

            const htmlTarget = target as HTMLElement;

            if (htmlTarget.hasAttribute("data-dialog")) {

                const dialog = constructor.getDialog(htmlTarget.dataset.dialog);
                dialog?.showModal();

            }

            if (htmlTarget.hasAttribute("data-dialog-hide")) {

                const selector = htmlTarget.dataset.dialogHide;
                const dialog = (
                    selector
                    ? constructor.getDialog(selector)
                    : htmlTarget.closest("dialog")
                );

                dialog?.close();

            }

            if (htmlTarget.matches("dialog, dialog *")) {

                const dialog = htmlTarget.closest("dialog");

                if (
                    dialog
                    && (dialog.dataset.close || "").match(/\bbackdrop\b/)
                    && !dialog.firstElementChild.contains(htmlTarget)
                ) {
                    dialog.close();
                }

            }

        });

    }

    updateRangeOutput(input: HTMLInputElement) {

        // const output = this.getOutputFromRange(input);

        // if (output) {
        //     output.value = input.value;
        // }

    }

}
