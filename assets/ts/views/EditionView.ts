import View from "./View";

export default class EditionView extends View<{
    "edition-selected": string
}> {

    private form: HTMLFormElement;
    private inputs: HTMLInputElement[];

    discoverElements(): void {

        this.form = document.getElementById("edition") as HTMLFormElement;

        this.inputs = [
            ...document.querySelectorAll<HTMLInputElement>("[name=\"edition\"]")
        ];

    }

    addListeners(): void {

        const {
            form,
            inputs
        } = this;

        form.addEventListener("submit", (e) => {

            e.preventDefault();
            const checked = inputs.find(({ checked }) => checked);

            if (checked) {
                this.trigger("edition-selected", checked.value);
            }

        });

    }

}
