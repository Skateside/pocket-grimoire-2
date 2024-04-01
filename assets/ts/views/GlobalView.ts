import View from "./View";
import {
    IDomLookupCache,
} from "../types/types";
import {
    makeLookupCache,
} from "../utilities/dom";

export default class GlobalView extends View {

    protected getOutputFromRange: IDomLookupCache<HTMLOutputElement>;

    constructor() {

        super();

        this.getOutputFromRange = makeLookupCache(({ dataset: { output } }) => {
            return document.querySelector<HTMLOutputElement>(output);
        });

    }

    addListeners(): void {

        document.addEventListener("input", ({ target }) => {

            const htmlTarget = target as HTMLElement;

            if (htmlTarget.matches("input[type=\"range\"][data-output]")) {
                this.updateRangeOutput(htmlTarget as HTMLInputElement);
            }

        });

    }

    updateRangeOutput(input: HTMLInputElement) {

        const output = this.getOutputFromRange(input);

        if (output) {
            output.value = input.value;
        }

    }

}
