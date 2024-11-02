import {
    IObservable,
    ObserverConverted,
    ObserverHandler,
} from "../types/classes";
import {
    create,
    getParents,
    identify,
    lookup,
} from "../utilities/dom";

export default class Observer<TEventMap = {}> implements IObservable<TEventMap> {

    protected element: HTMLElement;
    protected map: WeakMap<ObserverHandler, ObserverConverted>;

    static identify(element: HTMLElement) {

        return identify(
            element,
            "observer-",
            (id: string) => lookup(`#${id}`, getParents(element)),
        );

    }

    static create<TEventMap = {}>(element: HTMLElement = document.createElement("div")) {
        return new this<TEventMap>(element);
    }

    static createWithId<TEventMap = {}>(id?: string) {

        const attributes: { id?: string } = {};

        if (typeof id === "string") {
            attributes.id = id;
        }

        return this.create<TEventMap>(create("div", attributes));

    }

    constructor(element: HTMLElement = document.createElement("div")) {

        this.element = element;
        this.map = new WeakMap();

        (this.constructor as typeof Observer).identify(this.element);

    }

    getElement() {
        return this.element;
    }

    protected convertObserverHandler(
        handler: ObserverHandler,
    ): ObserverConverted {

        // https://stackoverflow.com/a/65996495/557019
        const converted: ObserverConverted = (
            ({ detail }: CustomEvent) => handler(detail)
        ) as EventListener;
        this.map.set(handler, converted);

        return converted;

    }

    protected unconvertObserverHandler(
        handler: ObserverHandler,
    ): ObserverConverted {

        const unconverted = this.map.get(handler);

        return unconverted || handler;

    }

    /*
    // Right now this will give me a ts(2345) error in Store.ts
    trigger<K extends keyof TEventMap>(
        ...[eventName, detail]: (
            TEventMap[K] extends void
            ? [eventName: K]
            : [eventName: K, detail: TEventMap[K]]
        )
    ) {

        this.element.dispatchEvent(
            new CustomEvent<TEventMap[K]>(eventName as string, {
                bubbles: false,
                cancelable: false,
                detail,
            })
        );

    }
    */
    trigger<K extends keyof TEventMap>(
        eventName: K,
        detail: TEventMap[K]
    ) {

        this.element.dispatchEvent(
            new CustomEvent<TEventMap[K]>(eventName as string, {
                bubbles: true,
                cancelable: false,
                detail,
            })
        );

    }

    on<K extends keyof TEventMap>(
        eventName: K,
        handler: ObserverHandler<TEventMap[K]>,
    ) {

        this.element.addEventListener(
            eventName as string,
            this.convertObserverHandler(handler),
        );

    }

    off<K extends keyof TEventMap>(
        eventName: K,
        handler: ObserverHandler<TEventMap[K]>,
    ) {

        this.element.removeEventListener(
            eventName as string,
            this.unconvertObserverHandler(handler),
        );

    }

    adopt(observer: Observer) {
        this.element.append(observer.getElement());
    }

    // createSubObserver<TEventMap = {}>(element: HTMLElement = document.createElement("div")) {

    //     const {
    //         element: parent,
    //     } = this;
    //     const constructor = this.constructor as typeof Observer;

    //     parent.append(element);
    //     return new constructor<TEventMap>(element);

    // }

}
