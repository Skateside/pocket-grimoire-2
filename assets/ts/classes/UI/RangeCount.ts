import {
    findOrDie,
} from "../../utilities/dom";

export default class RangeCount {

    protected input: HTMLInputElement;
    protected output: HTMLOutputElement;

    constructor(input: HTMLInputElement) {

        this.input = input;
        this.output = findOrDie(input.dataset.output);

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
