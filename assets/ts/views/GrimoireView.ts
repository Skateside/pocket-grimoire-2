import {
    IElementBox,
    ICoordinates,
} from "../types/data";
import View from "./View";
import Movable from "../classes/Movable";
import {
    findOrDie,
} from "../utilities/dom";
// import {
//     debounce,
// } from "../utilities/functions";

export default class GrimoireView extends View<{
    move: Required<ICoordinates> & {
        id: string,
        type: "seat" | "reminder",
    },
    resize: IElementBox,
}> {

    protected pad: HTMLElement;

    discoverElements() {

        this.pad = findOrDie(".js--grimoire");

    }

    getElementById(id: string): HTMLElement | null {

        const item = this.getItemSelector();
        return this.pad.querySelector<HTMLElement>(`${item}[data-index="${id}"]`);

    }

    getItemSelector() {
        return ".js--grimoire--token";
    }

    getPadDimensions(): IElementBox {
        return this.pad.getBoundingClientRect();
    }

    getMovableType(element: HTMLElement): "seat" | "reminder" {
        return element.dataset.type as ("seat" | "reminder");
    }

    addListeners() {

        const {
            pad,
        } = this;

        pad.addEventListener(
            Movable.UPDATE_EVENT,
            ({ target, detail }: CustomEvent<Required<ICoordinates>>) => {

                const type = this.getMovableType(target as HTMLElement);
                const id = (target as HTMLElement).dataset.index;

                this.trigger("move", {
                    ...detail,
                    type,
                    id,
                });

            },
        );

        pad.addEventListener(Movable.CLICK_EVENT, ({ target }) => {
// TODO: do something here
console.log({ event: Movable.CLICK_EVENT, target });
        });

        // NOTE: Limited support - might need to listen to scroll in a bugfix.
        document.addEventListener("scrollend", () => {
            this.trigger("resize", this.getPadDimensions());
        });

    }

}
