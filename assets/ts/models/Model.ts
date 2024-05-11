import Observer from "../utilities/Observer";
import Store from "../store/Store";

export default class Model<EventMap = {}> extends Observer<EventMap> {

    protected store: Store;

    constructor() {
        super();
        this.relayEvents();
        // this.store = Store.get();
    }

    relayEvents() {
        return;
    }

    load() {
        // return Promise.resolve();
    }

    setStore(store: Store) {
        this.store = store;
        return this;
    }

    getStore() {

        const {
            store,
        } = this;

        if (!store) {
            throw new Error("Store has not been set");
        }

        return store;

    }

    save() {
        this.store.save();
    }

}
