import type {
    IToggleableElement,
} from "../types/data";
import View from "./View";
import RangeCount from "../classes/UI/RangeCount";
import {
    unique,
} from "../utilities/arrays";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import {
    times,
} from "../utilities/numbers";
import {
    supplant,
    randomId,
} from "../utilities/strings";

export default class PlayersView extends View<{
    "count-update": number,
    "name-update": [number, string],
}> {

    protected range: HTMLInputElement;
    protected names: HTMLElement;
    protected datalist: HTMLDataListElement;
    protected rangeCount: RangeCount;
    protected elements: IToggleableElement[];

    discoverElements() {

        this.range = findOrDie("#players-count");
        this.names = findOrDie("#players-names");
        this.datalist = findOrDie("#players-names-list");
        this.rangeCount = new RangeCount(this.range);
        this.elements = [];

    }

    addListeners() {

        const {
            range,
            names,
        } = this;

        range.addEventListener("input", () => {
            this.trigger("count-update", Number(range.value));
        });

        names.addEventListener("input", ({ target }) => {

            const htmlTarget = target as HTMLInputElement;
            const match = htmlTarget.name.match(/\[(\d+)\]/);

            if (!match) {
                return;
            }

            this.trigger("name-update", [Number(match[1]), htmlTarget.value]);

        });

    }

    getCount() {
        return Number(this.range.value);
    }

    setCount(number: number) {
        this.range.value = String(number);
    }

    createNames(count: number) {

        const {
            names,
            elements,
        } = this;

        times(count, (index) => {

            const entry = this.createEntry(index);

            names.append(entry.placeholder);
            elements.push(entry);

        });

    }

    createEntry(index: number): IToggleableElement {

        const entry = this.drawEntry(index);

        return {
            element: entry.firstElementChild as HTMLElement,
            placeholder: document.createComment(String(index)),
        };

    }

    drawEntry(index: number) {

        const id = randomId("player-");
        const number = index + 1;

        return renderTemplate("#players-name-template", {
            ".js--players--name-label"(element: HTMLLabelElement) {

                element.htmlFor = id;
                element.textContent = supplant(element.dataset.text, [number]);

            },
            ".js--players--name-input"(element: HTMLInputElement) {

                element.id = id;
                element.name = supplant(element.name, [index]);

            },
        });

    }

    drawNames(count: number) {

        this.elements.forEach(({ element, placeholder }, index) => {

            const shouldShow = index < count;

            if (shouldShow && placeholder.parentElement) {
                placeholder.replaceWith(element);
            } else if (!shouldShow && element.parentElement) {

                element.replaceWith(placeholder);
                element.querySelector("input").value = "";

            }

        });

    }

    displayNames(names: string[]) {

        const {
            elements,
            datalist,
        } = this;

        elements.forEach(({ element }, index) => {
            element.querySelector("input").value = names[index] || "";
        });

        // Due to the way JSON handles sparsly-populated arrays, some of the
        // entries in `names` might be `null` - this filters out them as well as
        // any names that are just whitespace.
        const deduped = unique(
            names.map((name) => (
                typeof name === "string"
                ? name.trim()
                : ""
            ))
        ).filter(Boolean);

        datalist.innerHTML = "";
        datalist.append(deduped.reduce((fragment, name) => {

            const option = document.createElement("option");

            option.value = name;
            fragment.append(option);

            return fragment;

        }, document.createDocumentFragment()));

    }

}
