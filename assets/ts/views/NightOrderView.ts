import View from "./View";
import {
    querySelectorCached,
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import {
    // IRepositoryNightsRoles,
    IRole,
    INights,
    INightOrderData,
    INightOrderDatum,
} from "../types/data";
import {
    IObjectDiff,
} from "../types/utilities";

export default class NightOrderView extends View<{
}> {

    protected firstNight: HTMLElement;
    protected otherNight: HTMLElement;
    protected showNotInPlay: HTMLInputElement;

    discoverElements() {

        this.firstNight = findOrDie("#first-night")!;
        this.otherNight = findOrDie("#other-night")!;
        this.showNotInPlay = findOrDie<HTMLInputElement>("#show-all")!;

    }

    updateNights(nights: Record<INights, IObjectDiff<INightOrderDatum>>) {

        Object.entries(nights).forEach(([night, update]) => {
            this.updateNight(night as INights, update);
        });

    }

    insertRender(render: DocumentFragment, parent: HTMLElement, order: number) {

        let index = order;
        let reference = null;

        while (index > 0) {
            index -= 1;
            reference = parent.querySelector(`[data-order="${index}"]`);
        }

        parent.insertBefore(render, reference);

    }

// NOTE: Have I confused `data` and `datum` here?
    updateNight(night: INights, updates: IObjectDiff<INightOrderDatum>) {

        Object.entries(updates).forEach(([id, update]) => {

            const selector = [
                ".js--night-order-entry--wrapper",
                `[data-id="${id}"]`,
            ];
            let order = 0;

            if (update.type === "new" || update.type === "update") {

                order = update.value.order + 1;
                selector.push(`[data-order="${order}"]`);

            }

            const existing = (
                (update.type === "update" || update.type === "remove")
                ? this[night].querySelector(selector.join(""))
                : null
            );
            const render = (
                (update.type === "new" || update.type === "update")
                ? this.drawEntry(update.value.role, order, night)
                : null
            );

            if (
                update.type === "new"
                || (update.type === "update" && !existing)
            ) {
                return this.insertRender(render, this[night], order);
            }

            if (update.type === "update") {
                return existing.replaceWith(render);
            }

            if (update.type === "remove" && existing) {
                existing.remove();
            }

        });

    }

    // drawNights({ firstNight, otherNight }: Record<INights, IRole[]>) {

    //     this.firstNight.replaceChildren(
    //         ...firstNight.map((role) => this.drawEntry(role, "firstNight"))
    //     );

    //     this.otherNight.replaceChildren(
    //         ...otherNight.map((role) => this.drawEntry(role, "otherNight"))
    //     );

    // }

    drawEntry(role: IRole, index: number, type: INights) {

        return renderTemplate("#night-order-entry", {
            ".js--night-order-entry--wrapper"(element) {
                element.dataset.id = role.id;
                element.dataset.order = String(index);
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

    /*
    static markInPlay(element: HTMLElement, ids: string[]) {

        element.classList.toggle(
            "is-playing",
            ids.includes(element.dataset.id || ""),
        );

    }
    */

    /*
    markInPlay(roles: IRole[]) {

        const constructor = this.constructor as typeof NightOrderView;
        const ids = roles.map(({ id }) => id);

        this.firstNight
            .querySelectorAll<HTMLElement>(".js--night-order-entry--wrapper")
            .forEach((element) => {
                constructor.markInPlay(element, ids);
            });

        this.otherNights
            .querySelectorAll<HTMLElement>(".js--night-order-entry--wrapper")
            .forEach((element) => {
                constructor.markInPlay(element, ids);
            });

    }
    */

    /*
    addListeners() {

        const {
            firstNight,
            otherNights,
            showNotInPlay,
        } = this;

        showNotInPlay.addEventListener("change", () => {

            firstNight.classList.toggle("is-show-all", showNotInPlay.checked);
            otherNights.classList.toggle("is-show-all", showNotInPlay.checked);

        });

    }
    */

}
