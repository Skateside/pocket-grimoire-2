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

    updateNights(nights: Record<INights, IObjectDiff<INightOrderData>>) {

        Object.entries(nights).forEach(([night, update]) => {
            this.updateNight(night as INights, update);
        });

    }

// NOTE: Have I confused `data` and `datum` here?
    updateNight(night: INights, update: IObjectDiff<INightOrderData>) {
console.log({ night, update });

        Object.entries(update).forEach(([id, diff]) => {
        });

        // Object.entries(update).forEach(([id, diff]) => {

        //     const existing = (
        //         (diff.type === "update" || diff.type === "remove")
        //         ? this[night].querySelector(
        //             `.js--info-token--wrapper[data-id="${id}"]`
        //         )
        //         : null
        //     );
        //     const render = (
        //         (diff.type === "new" || diff.type === "update")
        //         ? this.drawEntry(diff.value.role, night)
        //         : null
        //     );


        // });

    }

    drawNights({ firstNight, otherNight }: Record<INights, IRole[]>) {

        this.firstNight.replaceChildren(
            ...firstNight.map((role) => this.drawEntry(role, "firstNight"))
        );

        this.otherNight.replaceChildren(
            ...otherNight.map((role) => this.drawEntry(role, "otherNight"))
        );

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
