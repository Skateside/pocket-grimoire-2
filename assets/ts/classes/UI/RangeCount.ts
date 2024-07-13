import {
    findOrDie,
    watchInput,
} from "../../utilities/dom";

export default class RangeCount {

    protected input: HTMLInputElement;
    protected output: HTMLOutputElement;

    constructor(input: HTMLInputElement, output?: HTMLOutputElement) {

        this.input = input;
        this.output = (
            output === undefined
            ? findOrDie(input.dataset.output)
            : output
        );

        this.addListeners();

    }

    addListeners() {

        const {
            input,
        } = this;

        input.addEventListener("input", () => this.display());
        watchInput(input, () => this.display());

    }

    display() {
        this.output.value = this.input.value;
    }

}
