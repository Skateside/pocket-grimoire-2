import View from "./View";

export default class GlobalView extends View {

    private rangeToOutput: WeakMap<HTMLInputElement, HTMLOutputElement>;

    constructor() {

        super();
        this.rangeToOutput = new WeakMap();

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

        const {
            rangeToOutput,
        } = this;
        let output = rangeToOutput.get(input);

        if (!output && !rangeToOutput.has(input)) {

            output = document
                .querySelector<HTMLOutputElement>(input.dataset.output);
            rangeToOutput.set(input, output);

        }

        if (!output) {
            return;
        }

        output.value = input.value;

    }

}
