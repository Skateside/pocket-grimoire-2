import View from "./View";
import {
    querySelectorCached,
    renderTemplate,
} from "../utilities/dom";
import {
    IRepositoryNightsRoles,
    IRole,
} from "../types/data";

export default class NightOrderView extends View<{
}> {

    protected firstNight: HTMLElement;
    protected otherNights: HTMLElement;
    protected showNotInPlay: HTMLInputElement;

    discoverElements() {

        const options = {
            required: true,
        };

        this.firstNight = querySelectorCached("#first-night", options)!;
        this.otherNights = querySelectorCached("#other-nights", options)!;
        this.showNotInPlay = querySelectorCached<HTMLInputElement>("#show-all", options)!;

    }

    drawNights({ first, other }: IRepositoryNightsRoles) {

        this.firstNight.replaceChildren(
            ...first.map((role) => this.drawEntry(role, "first"))
        );

        this.otherNights.replaceChildren(
            ...other.map((role) => this.drawEntry(role, "other"))
        );

    }

    drawEntry(role: IRole, type: keyof IRepositoryNightsRoles) {

        return renderTemplate("#night-order-entry", {
            ".js--night-order-entry--wrapper"(element) {
                element.dataset.id = role.id;
            },
            ".js--night-order-entry--name"(element) {
                element.textContent = role.name;
            },
            ".js--night-order-entry--text"(element) {
                element.textContent = role[`${type}NightReminder`];
            },
            // TEMP: this is only commented out to prevent 404's in the console.
            // ".js--night-order-entry--image"(element) {
            //     (element as HTMLImageElement).src = role.image;
            // },
        });

    }

    static markInPlay(element: HTMLElement, ids: string[]) {

        element.classList.toggle(
            "is-playing",
            ids.includes(element.dataset.id || ""),
        );

    }

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

}
