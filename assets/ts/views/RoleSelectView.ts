import View from "./View";
import {
    ITeam,
    IRole,
} from "../types/types";
import {
    renderTemplate,
    serialiseForm,
} from "../utilities/dom";
import {
    supplant,
} from "../utilities/strings";

export default class RoleSelectView extends View<{
    "roles-selected": Record<string, number | string>,
}> {

    private form: HTMLElement;
    private fieldsets: Record<ITeam, HTMLElement>;
    private roleDraw: HTMLElement;
    private rangeToOutput: WeakMap<HTMLInputElement, HTMLOutputElement>;
    private checkboxToRange: WeakMap<HTMLInputElement, HTMLInputElement>;

    constructor() {

        super();
        this.rangeToOutput = new WeakMap();
        this.checkboxToRange = new WeakMap();

    }

    discoverElements() {

        this.form = document.querySelector(".js--role-select");

        this.fieldsets = Array.prototype.reduce.call(
            document.querySelectorAll(".js--role-select--team"),
            (group: Record<ITeam, HTMLElement>, element: HTMLElement) => {

                group[element.dataset.team as ITeam] = (
                    element.querySelector(".js--role-select--items")
                );
                return group;

            },
            Object.create(null)
        );

        this.roleDraw = document.querySelector(".js--role-draw");

    }

    drawSelection(teams: Record<ITeam, IRole[]>) {

        Object.entries(teams).forEach(([team, roles]) => {

            const fieldset = this.fieldsets[team as ITeam];
            fieldset.replaceChildren(
                ...roles.map((role) => renderTemplate("#role-select", {
                    ".js--role-select--checkbox"(element: HTMLInputElement) {
                        element.value = role.id;
                    },
                    ".js--role-select--image"(element: HTMLImageElement) {
                        element.src = role.image;
                    },
                    ".js--role-select--name"(element) {
                        element.textContent = role.name;
                    },
                    ".js--role-select--ability"(element) {
                        element.textContent = role.ability;
                    },
                    ".js--role-select--quantity"(element) {

                        element.textContent = supplant(
                            element.dataset.text,
                            [role.name]
                        );

                    },
                    ".js--role-select--input"(element: HTMLInputElement) {
                        element.name = `quantity[${role.id}]`;
                    }
                }))
            );

        });

    }

    drawBag(bag: IRole[]) {

        this.roleDraw.replaceChildren(
            ...bag.map((role, index) => renderTemplate("#role-draw", {
                ".js--role-draw--button"(element) {
                    element.textContent = String(index + 1);
                    element.textContent += ` (${role.name})`; // TEMP
                    // TODO: make some hidden data to associate the button with
                    // the role - the current PG uses a data-* attribute,
                    // exposing the information.
                }
            }))
        );

    }

    addListeners() {

        const {
            form
        } = this;

        form.addEventListener("input", ({ target }) => {

            const input = target as HTMLInputElement;

            if (input.matches(".js--role-select--input")) {
                return this.updateOutput(input);
            }

            if (input.matches(".js--role-select--checkbox")) {
                return this.updateRange(input);
            }

        });

        form.addEventListener("submit", (e) => {

            e.preventDefault();
            const { quantity } = serialiseForm(form as HTMLFormElement);
            this.trigger("roles-selected", quantity);

        });

    }

    getOutputFromRange(input: HTMLInputElement) {

        const {
            rangeToOutput,
        } = this;

        if (!rangeToOutput.has(input)) {

            rangeToOutput.set(
                input,
                input
                    .closest(".js--role-select--role")
                    .querySelector<HTMLOutputElement>(".js--role-select--output")
            );

        }

        return rangeToOutput.get(input);

    }

    updateOutput(input: HTMLInputElement) {
        this.getOutputFromRange(input).value = input.value;
    }

    getRangeFromCheckbox(input: HTMLInputElement) {

        const {
            checkboxToRange,
        } = this;

        if (!checkboxToRange.has(input)) {

            checkboxToRange.set(
                input,
                input
                    .closest(".js--role-select--role")
                    .querySelector<HTMLInputElement>(".js--role-select--input")
            );

        }

        return checkboxToRange.get(input);

    }

    updateRange(input: HTMLInputElement) {

        const range = this.getRangeFromCheckbox(input);
        range.value = String(Number(input.checked));
        this.updateOutput(range);

    }

}
