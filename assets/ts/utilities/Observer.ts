import {
    ObserverHandler,
    ObserverConverted
} from "../types/types";

export default class Observer<TEventMap = {}> {

    private observerElement: HTMLElement;
    private observerMap: WeakMap<ObserverHandler, ObserverConverted>;

    constructor() {

        this.observerElement = document.createElement("div");
        this.observerMap = new WeakMap();

    }

    private convertObserverHandler(
        handler: ObserverHandler
    ): ObserverConverted {

        // https://stackoverflow.com/a/65996495/557019
        const converted: ObserverConverted = (
            ({ detail }: CustomEvent) => handler(detail)
        ) as EventListener;
        this.observerMap.set(handler, converted);

        return converted;

    }

    private unconvertObserverHandler(
        handler: ObserverHandler
    ): ObserverConverted {

        const unconverted = this.observerMap.get(handler);

        return unconverted || handler;

    }

    trigger<K extends keyof TEventMap>(eventName: K, detail: TEventMap[K]) {

        this.observerElement
            .dispatchEvent(new CustomEvent<TEventMap[K]>(eventName as string, {
                detail,
                bubbles: false,
                cancelable: false,
            }));

    }

    on<K extends keyof TEventMap>(
        eventName: K,
        handler: ObserverHandler<TEventMap[K]>
    ) {

        this.observerElement.addEventListener(
            eventName as string,
            this.convertObserverHandler(handler)
        );

    }

    off<K extends keyof TEventMap>(
        eventName: K,
        handler: ObserverHandler<TEventMap[K]>
    ) {

        this.observerElement.addEventListener(
            eventName as string,
            this.unconvertObserverHandler(handler)
        );

    }

}
