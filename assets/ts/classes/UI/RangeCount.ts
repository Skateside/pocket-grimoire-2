import {
    findOrDie,
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
            output,
        } = this;

        input.addEventListener("input", () => {
            output.value = input.value;
        });

    }

}
