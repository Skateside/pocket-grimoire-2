import type {
    IPlayers,
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

type IPlayerToggleableElement = IToggleableElement & {
    input: HTMLInputElement,
    remove: HTMLButtonElement,
};

export default class PlayersView extends View<{
    "count-update": number,
    "name-update": [number, string],
    "name-remove": number,
}> {

    protected range: HTMLInputElement;
    protected names: HTMLElement;
    protected datalist: HTMLDataListElement;
    protected rangeCount: RangeCount;
    protected elements: IPlayerToggleableElement[];

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

        names.addEventListener("click", ({ target }) => {

            const remove = (target as HTMLElement)
                .closest<HTMLButtonElement>(".js--players--name-remove");

            if (!remove) {
                return;
            }

            this.trigger("name-remove", Number(remove.dataset.index));

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

    createEntry(index: number): IPlayerToggleableElement {

        const entry = this.drawEntry(index);
        const element = entry.firstElementChild as HTMLElement;

        return {
            element,
            input: element.querySelector(".js--players--name-input"),
            remove: element.querySelector(".js--players--name-remove"),
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
            ".js--players--name-remove"(element) {
                element.dataset.index = String(index);
            },
        });

    }

    updateNames({ count, names }: IPlayers) {

        this.setCount(count);
        this.drawNames(count);
        this.displayNames(names);

    }

    drawNames(count: number) {

        this.elements.forEach(({ element, input, placeholder }, index) => {

            const shouldShow = index < count;

            if (shouldShow && placeholder.parentElement) {
                placeholder.replaceWith(element);
            } else if (!shouldShow && element.parentElement) {

                element.replaceWith(placeholder);
                input.value = "";

            }

        });

    }

    displayNames(names: string[]) {

        const {
            elements,
            datalist,
        } = this;

        elements.forEach(({ input, remove }, index) => {

            const name = names[index] || "";

            input.value = name;
            remove.hidden = !name;

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
