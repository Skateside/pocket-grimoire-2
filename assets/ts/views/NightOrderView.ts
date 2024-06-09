import View from "./View";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import {
    IRole,
    INights,
    INightOrderDatum,
} from "../types/data";
import {
    replace,
} from "../utilities/arrays";

type INightOrderEntry = {
    id: string,
    added: boolean,
    dead: boolean,
    element: HTMLElement,
    placeholder: Comment,
};

export default class NightOrderView extends View<{
}> {

    protected firstNight: HTMLElement;
    protected otherNight: HTMLElement;
    protected showAllInput: HTMLInputElement;
    protected showDeadInput: HTMLInputElement;
    protected entries: Record<INights, INightOrderEntry[]>;
    protected showNotAdded: boolean;
    protected showDead: boolean;

    discoverElements() {

        this.firstNight = findOrDie("#first-night");
        this.otherNight = findOrDie("#other-night");
        this.showAllInput = findOrDie<HTMLInputElement>("#show-all");
        this.showDeadInput = findOrDie<HTMLInputElement>("#show-dead");

        this.entries = {
            firstNight: [],
            otherNight: [],
        };
        this.showNotAdded = false;
        this.showDead = false;

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

            this.showNotAdded = checked;

            if (checked && !showDeadInput.checked) {
                showDeadInput.checked = true;
            }

            this.showEntries();

        });

        showDeadInput.addEventListener("change", () => {

            this.showDead = showDeadInput.checked;
            this.showEntries();

        });

    }

    drawNights(nights: Record<INights, INightOrderDatum[]>) {

        Object
            .entries(nights)
            .forEach(([night, data]: [INights, INightOrderDatum[]]) => {

                const entries = data.map((datum) => {
                    return this.createEntry(datum, night);
                });

                replace(this.entries[night], entries);
                this[night].replaceChildren(
                    ...entries.map(({ placeholder }) => placeholder)
                );

            });

        this.showEntries();
        this.updateAllRenders();

    }

    createEntry(datum: INightOrderDatum, night: INights): INightOrderEntry {

        const entry = this.drawEntry(datum.role, night);

        return {
            id: datum.role.id,
            added: datum.added > 0 || datum.role.edition === "-pg-",
            dead: datum.dead > 0,
            element: entry.firstElementChild as HTMLElement,
            placeholder: document.createComment(datum.role.id),
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

    showEntries() {

        const {
            showNotAdded,
            showDead,
        } = this;

        Object.entries(this.entries).forEach(([night, entries]) => {

            night = night as INights;

            entries.forEach(({ added, dead, element, placeholder }) => {

                const shouldShow = (
                    (added && !dead)
                    || (!added && showNotAdded)
                    || (dead && showDead)
                );

                if (shouldShow && placeholder.parentElement) {
                    placeholder.replaceWith(element);
                } else if (!shouldShow && element.parentElement) {
                    element.replaceWith(placeholder);
                }

            });

        });

    }

    updateRender(entry: INightOrderEntry) {

        entry.element.classList.toggle("is-added", entry.added);
        entry.element.classList.toggle("is-dead", entry.dead);

    }

    updateRenderById(id: string) {

        Object.values(this.entries).forEach((entries) => {

            const entry = entries.find((entry) => entry.id == id);

            if (!entry) {
                return;
            }

            this.updateRender(entry);

        });

    }

    updateAllRenders() {

        Object.values(this.entries).forEach((entries) => {
            entries.forEach((entry) => this.updateRender(entry));
        });

    }

}
