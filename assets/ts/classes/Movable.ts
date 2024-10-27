import type {
    IElementBox,
    ICoordinates,
} from "../types/data";
import Observer from "./Observer";
import {
    noop,
} from "../utilities/functions";
import {
    clamp,
} from "../utilities/numbers";

export default class Movable extends Observer<{
    update: {
        element: HTMLElement,
        coords: ICoordinates,
    },
}> {

    protected xOffset: number;
    protected yOffset: number;
    protected left: number;
    protected top: number;
    protected width: number;
    protected height: number;
    protected selector: string;
    // protected isDragging: boolean;
    protected zIndex: number;
    protected dragHandler: (event: MouseEvent | TouchEvent) => void;

    // TODO: Replace with an observer.
    static get UPDATE_EVENT() {
        return "movable-update";
    }

    constructor() {

        super();

        this.left = 0;
        this.top = 0;
        this.width = 0;
        this.height = 0;
        this.selector = "*";
        // this.isDragging = false;
        this.zIndex = 0;
        this.dragHandler = noop;

    }

    setDimensions({ left, top, width, height }: IElementBox) {

        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;

        return this;

    }

    setSelector(selector: string) {

        this.selector = selector;

        return this;

    }

    setZIndex(zIndex: number) {

        this.zIndex = zIndex;

        return this;

    }

    advanceZIndex() {

        this.zIndex += 1;

        return this.zIndex;

    }

    run() {
        this.addListeners();
    }

    addListeners() {

        const handler: EventListenerObject = {
            handleEvent: this.handleEvent.bind(this),
        };

        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        document.addEventListener("mouseup", handler);
        document.addEventListener("touchend", handler);
        document.addEventListener("contextmenu", handler);

    }

    handleEvent(event: Event) {

        switch (event.type) {

        case "mousedown":
        case "touchstart":
            this.start(event as MouseEvent | TouchEvent);
            break;

        case "mouseup":
        case "touchend":
        case "contextmenu":
            this.stop();
            break;

        }

    }

    start(event: MouseEvent | TouchEvent) {

        const element = (event.target as HTMLElement).closest<HTMLElement>(this.selector);

        if (!element) {
            return;
        }

        this.startDrag(element, event);

        // const zIndex = this.advanceZIndex();
        // element.style.setProperty("--z-index", String(zIndex));
        this.advanceZIndex();

        // this.observer.trigger("zIndex", {
        //     zIndex,
        //     element: token
        // });

    }

    stop() {
        this.endDragging();
    }

    startDrag(element: HTMLElement, event: MouseEvent | TouchEvent) {

        const {
            left,
            top
        } = element.getBoundingClientRect();

        this.endDragging();
        this.dragHandler = (event) => this.dragObject(element, event);

        if (event instanceof MouseEvent) {

            const {
                clientX,
                clientY,
            } = event;

            this.xOffset = clientX - left + this.left;
            this.yOffset = clientY - top + this.top;
            window.addEventListener("mousemove", this.dragHandler);

        } else if (event instanceof TouchEvent) {

            const {
                targetTouches,
            } = event;

            if (!targetTouches.length) {
                return;
            }

            this.xOffset = targetTouches[0].clientX - left + this.left;
            this.yOffset = targetTouches[0].clientY - top + this.top;
            window.addEventListener("touchmove", this.dragHandler, {
                passive: false
            });

        }

    }

    endDragging() {

        if (this.dragHandler === noop) {
            return;
        }

        window.removeEventListener("mousemove", this.dragHandler);
        window.removeEventListener("touchmove", this.dragHandler);
        this.dragHandler = noop;

        // The order of events is mousedown -> mouseup -> click. This means
        // that we need to delay the resetting of `this.isDragging` so that
        // the handler attached to the click event listener doesn't trigger
        // after dragging. This only seems to be an issue on desktop, mobile
        // seems to be fine.
        // window.requestAnimationFrame(() => this.isDragging = false);

    }

    dragObject(element: HTMLElement, event: MouseEvent | TouchEvent) {

        event.preventDefault();

        const {
            width,
            height
        } = element.getBoundingClientRect();
        let leftValue = 0;
        let topValue = 0;

        if (event instanceof MouseEvent) {

            const {
                clientX,
                clientY,
            } = event;

            leftValue = clientX - this.xOffset;
            topValue = clientY - this.yOffset;
            // this.isDragging = true;

        } else if (event instanceof TouchEvent) {

            const {
                targetTouches,
            } = event;

            if (targetTouches.length) {

                leftValue = targetTouches[0].clientX - this.xOffset;
                topValue = targetTouches[0].clientY - this.yOffset;

            }

        }

        this.moveTo(
            element,
            clamp(0, leftValue, this.width - width),
            clamp(0, topValue, this.height - height),
        );

    }

    moveTo(element: HTMLElement, left: number, top: number, zIndex?: number) {


        if (typeof zIndex !== "number" || Number.isNaN(zIndex)) {
            zIndex = this.zIndex;
        }

        //*
        element.style.setProperty("--left", String(left));
        element.style.setProperty("--top", String(top));
        element.style.setProperty("--z-index", String(zIndex));

        const {
            UPDATE_EVENT,
        } = (this.constructor as typeof Movable);

        element.dispatchEvent(new CustomEvent(UPDATE_EVENT, {
            bubbles: true,
            cancelable: false,
            detail: {
                left,
                top,
                zIndex,
            },
        }));
        /*/
        this.trigger("update", {
            element,
            coords: {
                x: left,
                y: top,
                z: zIndex,
            },
        });
        //*/

    }

    // getPosition(element: HTMLElement): ICoordinates {

    //     return {
    //         x: Number(element.style.getPropertyValue("--left")) || 0,
    //         y: Number(element.style.getPropertyValue("--top")) || 0,
    //         z: Number(element.style.getPropertyValue("--z-index")) || 0,
    //     };

    // }

}
