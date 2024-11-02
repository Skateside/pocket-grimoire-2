import type {
    IObservable,
    ObserverHandler,
} from "../types/classes";
import Observer from "../classes/Observer";
import Store from "../classes/Store";

export default class Model<EventMap = {}> implements IObservable<EventMap> {

    protected observer: Observer<EventMap>;
    protected store: Store;

    setStore(store: Store) {
        this.store = store;
        return this;
    }

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

    addStoreListeners() {
        return;
    }

    ready() {

        this.addStoreListeners();

    }

}
