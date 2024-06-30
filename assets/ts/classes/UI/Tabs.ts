import type {
    ITabData,
} from "../../types/classes";
import {
    findOrDie,
} from "../../utilities/dom";

export default class Tabs {

    static getPanelFromTab(tab: HTMLElement) {

        const id = tab.getAttribute("aria-controls");

        return (
            id === null
            ? null
            : document.getElementById(id)
        );

    }

    protected holder: HTMLElement;
    protected elements: ITabData[];

    constructor(holder: HTMLElement) {

        this.holder = holder;
        this.elements = [];

        this.discoverElements();
        this.addListeners();
        this.showFirst(true);

    }

    discoverElements() {

        const {
            holder,
            elements,
        } = this;

        holder
            .querySelectorAll<HTMLButtonElement>("[role=\"tab\"]")
            .forEach((tab, index) => {

                const id = tab.getAttribute("aria-controls");
                const panel = findOrDie(`#${id}`);

                elements[index] = {
                    tab,
                    panel,
                    active: false,
                };

            });

    }

    addListeners() {

        this.elements.forEach(({ tab }, index) => {

            tab.addEventListener("click", () => {
                this.show(index);
            });

            tab.addEventListener("keydown", (event) => {

                let flag = false;

                switch (event.key) {

                case "ArrowLeft":
                case "ArrowDown":
                    this.showPrevious();
                    flag = true;
                    break;

                case "ArrowRight":
                case "ArrowUp":
                    this.showNext();
                    flag = true;
                    break;

                case "Home":
                    this.showFirst();
                    flag = true;
                    break;

                case "End":
                    this.showLast();
                    flag = true;
                    break;

                }

                if (flag) {
                    event.preventDefault();
                    event.stopPropagation();
                }

            });

        });

    }

    getHolder() {
        return this.holder;
    }

    getActiveIndex() {
        return this.elements.findIndex(({ active }) => active);
    }

    show(index: number, suppressFocus = false) {

        if (index === this.getActiveIndex()) {
            return;
        }

        this.elements.forEach((data, elementIndex) => {

            if (index === elementIndex) {
                this.showData(data, suppressFocus);
            } else {
                this.hideData(data);
            }

        });

    }

    protected showData(data: ITabData, suppressFocus = false) {

        const {
            tab,
            panel,
        } = data;

        tab.removeAttribute("tabindex");
        tab.setAttribute("aria-selected", "true");
        panel.hidden = false;
        data.active = true;

        if (!suppressFocus) {
            tab.focus();
        }

        tab.dispatchEvent(new CustomEvent("tab-show", {
            bubbles: true,
            cancelable: false,
        }));

    }

    protected hideData(data: ITabData) {

        const {
            tab,
            panel,
        } = data;
        const wasShowing = data.active;

        tab.tabIndex = -1;
        tab.setAttribute("aria-selected", "false");
        panel.hidden = true;
        data.active = false;

        if (wasShowing) {

            tab.dispatchEvent(new CustomEvent("tab-hide", {
                bubbles: true,
                cancelable: false,
            }));

        }

    }

    showPrevious() {

        const activeIndex = this.getActiveIndex();
        this.show(
            activeIndex === 0
            ? this.elements.length - 1
            : activeIndex - 1
        );

    }

    showNext() {
        this.show((this.getActiveIndex() + 1) % this.elements.length);
    }

    showFirst(suppressFocus = false) {
        this.show(0, suppressFocus);
    }

    showLast() {
        this.show(this.elements.length - 1);
    }

}
