import type {
    IObservable,
    ObserverHandler,
} from "../types/classes";
import Observer from "../classes/Observer";

export default class View<EventMap = {}> implements IObservable<EventMap> {

    protected observer: Observer<EventMap>;


    setObserver(observer: Observer<EventMap>) {
        this.observer = observer;
        return this;
    }

    on<K extends keyof EventMap>(
        eventName: K,
        handler: ObserverHandler<EventMap[K]>,
    ): void {
        return this.observer.on(eventName, handler);
    }

    off<K extends keyof EventMap>(
        eventName: K,
        handler: ObserverHandler<EventMap[K]>,
    ): void {
        return this.observer.off(eventName, handler);
    }

    trigger<K extends keyof EventMap>(
        eventName: K,
        detail: EventMap[K],
    ): void {
        return this.observer.trigger(eventName, detail);
    }

    discoverElements() {
        return;
    }

    addListeners() {
        return;
    }

    ready() {

        this.discoverElements();
        this.addListeners();

    }

    request(method: PropertyKey, ...args: any[]): any {
        console.warn("Requester has not been set up");
    }

    setRequester(requester: (method: PropertyKey, ...args: any[]) => any) {
        this.request = requester;
    }

}
