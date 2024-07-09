import View from "./View";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import {
    empty,
} from "../utilities/objects";
import {
    IRole,
    INights,
    INightOrderFilters,
    INightOrderDatum,
    IToggleableElement,
} from "../types/data";
import {
    IObjectDiff,
} from "../types/utilities";

export default class NightOrderView extends View<{
    "filters-update": INightOrderFilters,
}> {

    protected firstNight: HTMLElement;
    protected otherNight: HTMLElement;
    protected showAllInput: HTMLInputElement;
    protected showDeadInput: HTMLInputElement;
    protected filter: INightOrderFilters;
    protected elements: Record<INights, Record<string, IToggleableElement>>;

    discoverElements() {

        this.firstNight = findOrDie("#first-night");
        this.otherNight = findOrDie("#other-night");
        this.showAllInput = findOrDie("#show-all");
        this.showDeadInput = findOrDie("#show-dead");
        this.elements = {
            firstNight: Object.create(null),
            otherNight: Object.create(null),
        };

    }

    addListeners() {

        const {
            showAllInput,
            showDeadInput,
        } = this;

        showAllInput.addEventListener("change", () => {

            const {
                checked,
            } = showAllInput;

            if (checked && !showDeadInput.checked) {
                showDeadInput.checked = true;
            }

            this.announceFilters();

        });

        showDeadInput.addEventListener("change", () => {
            this.announceFilters();
        });

    }

    getFilters() {

        return {
            showNotAdded: this.showAllInput.checked,
            showDead: this.showDeadInput.checked,
        };

    }

    announceFilters() {
        this.trigger("filters-update", this.getFilters());
    }

    drawNights(nights: Record<INights, IRole[]>) {

        Object
            .entries(nights)
            .forEach(([night, roles]: [INights, IRole[]]) => {

                const elements = Object.fromEntries(roles.map((role) => [
                    role.id,
                    this.createEntry(role, night),
                ]));

                Object.assign(empty(this.elements[night]), elements);
                this[night].replaceChildren(
                    ...Object
                        .values(elements)
                        .map(({ placeholder }) => placeholder)
                );

            });

    }

    updateElements(difference: IObjectDiff<INightOrderDatum>) {

        Object.entries(this.elements).forEach(([night, elements]) => {

            night = night as INights;

            Object.entries(difference).forEach(([id, diff]) => {

                if (!Object.hasOwn(elements, id) || diff.type === "remove") {
                    return;
                }

                const {
                    placeholder,
                    element,
                } = elements[id];
                const {
                    added,
                    dead,
                    show,
                } = diff.value;

                element.classList.toggle("is-added", added);
                element.classList.toggle("is-dead", dead);

                if (show && placeholder.parentElement) {
                    placeholder.replaceWith(element);
                } else if (!show && element.parentElement) {
                    element.replaceWith(placeholder);
                }

            });

        });

    }

    createEntry(role: IRole, night: INights): IToggleableElement {

        const entry = this.drawEntry(role, night);

        return {
            element: entry.firstElementChild as HTMLElement,
            placeholder: document.createComment(role.id),
        };

    }

    drawEntry(role: IRole, type: INights) {

        return renderTemplate("#night-order-entry", {
            ".js--night-order-entry--wrapper"(element) {
                element.dataset.id = role.id;
            },
            ".js--night-order-entry--name"(element) {
                element.textContent = role.name;
            },
            ".js--night-order-entry--text"(element) {
                element.textContent = role[`${type}Reminder`];
            },
            // TEMP: this is only commented out to prevent 404's in the console.
            // ".js--night-order-entry--image"(element) {
            //     (element as HTMLImageElement).src = role.image;
            // },
        });

    }

}
