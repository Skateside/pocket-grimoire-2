import {
    IElementBox,
} from "../types/data";
import View from "./View";
import Movable from "../classes/Movable";
import {
    findOrDie,
} from "../utilities/dom";

export default class GrimoireView extends View<{
}> {

    protected pad: HTMLElement;

    discoverElements() {

        this.pad = findOrDie(".js--grimoire");

    }

    getItemSelector() {
        return ".js--grimoire--token";
    }

    getPadDimensions(): IElementBox {
        return this.pad.getBoundingClientRect();
    }

    addListeners() {

        const {
            pad,
        } = this;

        pad.addEventListener(Movable.UPDATE_EVENT, () => {});

        // TODO: Put this into a seperate class.
        // const handler: EventListenerObject = {
        //     handleEvent: this.handleEvent.bind(this),
        // };

        // document.addEventListener("mousedown", handler);
        // document.addEventListener("touchstart", handler);
        // document.addEventListener("mouseup", handler);
        // document.addEventListener("touchend", handler);
        // document.addEventListener("contextmenu", handler);
        // document.addEventListener("click", handler);
        // window.addEventListener("resize", handler);
        // window.addEventListener("scroll", handler);

    }

    // handleEvent(event: Event) {

    //     switch (event.type) {

    //     case "mousedown":
    //     case "touchstart":
    //         this.handleInteractStart(event);
    //         break;

    //     case "mouseup":
    //     case "touchend":
    //     case "contextmenu":
    //         this.handleInteractEnd(event);
    //         break;

    //     // case "click":
    //     //     this.handleInteract(event);
    //     //     break;

    //     // case "resize":
    //     //     this.onResize(e);
    //     //     break;

    //     // case "scroll":
    //     //     scollHandler(e);
    //     //     break;

    //     }

    // }

    // handleInteractStart(event: Event) {

    //     const seat = (event.target as HTMLElement).closest(".seat");

    //     if (!seat) {
    //         return;
    //     }

    //     this.startDrag(seat);

    // }

    // handleInteractEnd(event: Event) {
    // }

    // // handleInteract(event: Event) {
    // // }

    // startDrag(seat: Element) {

    // }

}
