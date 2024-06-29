import {
    ObserverHandler,
    ObserverConverted,
} from "../types/classes";

export default class Observer<TEventMap = {}> {

    protected observerElement: HTMLElement;
    protected observerMap: WeakMap<ObserverHandler, ObserverConverted>;

    constructor() {

        this.observerElement = document.createElement("div");
        this.observerMap = new WeakMap();

    }

    protected convertObserverHandler(
        handler: ObserverHandler,
    ): ObserverConverted {

        // https://stackoverflow.com/a/65996495/557019
        const converted: ObserverConverted = (
            ({ detail }: CustomEvent) => handler(detail)
        ) as EventListener;
        this.observerMap.set(handler, converted);

        return converted;

    }

    protected unconvertObserverHandler(
        handler: ObserverHandler,
    ): ObserverConverted {

        const unconverted = this.observerMap.get(handler);

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

        this.observerElement.dispatchEvent(
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

        this.observerElement.dispatchEvent(
            new CustomEvent<TEventMap[K]>(eventName as string, {
                bubbles: false,
                cancelable: false,
                detail,
            })
        );

    }

    on<K extends keyof TEventMap>(
        eventName: K,
        handler: ObserverHandler<TEventMap[K]>,
    ) {

        this.observerElement.addEventListener(
            eventName as string,
            this.convertObserverHandler(handler),
        );

    }

    off<K extends keyof TEventMap>(
        eventName: K,
        handler: ObserverHandler<TEventMap[K]>,
    ) {

        this.observerElement.removeEventListener(
            eventName as string,
            this.unconvertObserverHandler(handler),
        );

    }

}
