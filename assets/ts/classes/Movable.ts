import type {
    IElementBox,
    ICoordinates,
} from "../types/data";
import {
    noop,
} from "../utilities/functions";
import {
    clamp,
} from "../utilities/numbers";

export default class Movable {

    protected xOffset: number;
    protected yOffset: number;
    protected x: number;
    protected y: number;
    protected z: number;
    protected width: number;
    protected height: number;
    protected selector: string;
    protected isDragging: boolean;
    protected dragHandler: (event: MouseEvent | TouchEvent) => void;
    protected onComplete: () => void;

    static get UPDATE_EVENT() {
        return "movable-update";
    }

    static get CLICK_EVENT() {
        return "movable-click";
    }

    constructor() {

        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.width = 0;
        this.height = 0;
        this.selector = "*";
        this.isDragging = false;
        this.dragHandler = noop;
        this.onComplete = noop;

    }

    setDimensions({ left, top, width, height }: IElementBox) {

        this.x = left;
        this.y = top;
        this.width = width;
        this.height = height;

        return this;

    }

    setSelector(selector: string) {

        this.selector = selector;

        return this;

    }

    setZ(z: number) {

        this.z = z;

        return this;

    }

    advanceZ() {

        this.z += 1;

        return this.z;

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
        document.addEventListener("click", handler);
        // TODO: scroll

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

        case "click":
            this.checkClick(event as PointerEvent);
            break;

        }

    }

    start(event: MouseEvent | TouchEvent) {

        const element = (event.target as HTMLElement).closest<HTMLElement>(this.selector);

        if (!element) {
            return;
        }

        this.startDrag(element, event);

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
        this.onComplete = () => this.announcePosition(element);

        element.style.setProperty("--z", String(this.advanceZ()));

        if (event instanceof MouseEvent) {

            const {
                clientX,
                clientY,
            } = event;

            this.xOffset = clientX - left + this.x;
            this.yOffset = clientY - top + this.y;
            window.addEventListener("mousemove", this.dragHandler);

        } else if (event instanceof TouchEvent) {

            const {
                targetTouches,
            } = event;

            if (!targetTouches.length) {
                return;
            }

            this.xOffset = targetTouches[0].clientX - left + this.x;
            this.yOffset = targetTouches[0].clientY - top + this.y;
            window.addEventListener("touchmove", this.dragHandler, {
                passive: false
            });

        }

    }

    endDragging() {

        if (this.dragHandler === noop) {
            return;
        }

        this.onComplete();
        window.removeEventListener("mousemove", this.dragHandler);
        window.removeEventListener("touchmove", this.dragHandler);
        this.dragHandler = noop;
        this.onComplete = noop;

        // The order of events is mousedown -> mouseup -> click. This means
        // that we need to delay the resetting of `this.isDragging` so that
        // the handler attached to the click event listener doesn't trigger
        // after dragging. This only seems to be an issue on desktop, mobile
        // seems to be fine.
        // We have to wait for `requestAnimationFrame` because
        // `Promise.resolve().then()` is too fast and dragging will look like
        // clicking.
        window.requestAnimationFrame(() => this.isDragging = false);

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
            this.isDragging = true;

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
            {
                x: clamp(0, leftValue, this.width - width),
                y: clamp(0, topValue, this.height - height),
            },
        );

    }

    moveTo(element: HTMLElement, { x, y, z }: ICoordinates) {


        if (typeof z !== "number" || Number.isNaN(z)) {
            z = this.z;
        }

        element.style.setProperty("--x", String(x));
        element.style.setProperty("--y", String(y));
        element.style.setProperty("--z", String(z));

    }

    announcePosition(element: HTMLElement) {

        const {
            UPDATE_EVENT,
        } = (this.constructor as typeof Movable);

        element.dispatchEvent(new CustomEvent(UPDATE_EVENT, {
            bubbles: true,
            cancelable: false,
            detail: {
                x: Number(element.style.getPropertyValue("--x")),
                y: Number(element.style.getPropertyValue("--y")),
                z: Number(element.style.getPropertyValue("--z")),
            },
        }));

    }

    checkClick(event: PointerEvent) {

        const element = (event.target as HTMLElement).closest<HTMLElement>(this.selector);

        if (!element || this.isDragging) {
            return;
        }

        const {
            CLICK_EVENT,
        } = (this.constructor as typeof Movable);

        element.dispatchEvent(new CustomEvent(CLICK_EVENT, {
            bubbles: true,
            cancelable: false,
        }));

    }

}
