import Observer from "../utilities/Observer";
import Store from "../store/Store";

export default class Model<EventMap = {}> extends Observer<EventMap> {

    protected store: Store;

    constructor(store: Store) {
        super();
        this.setStore(store);
        this.setup();
        // this.store = Store.get();
    }

    setup() {
        return;
    }

    // relayEvents() {
    //     return;
    // }

    // load() {
    //     // return Promise.resolve();
    // }

    setStore(store: Store) {
        this.store = store;
        this.addStoreListeners();
        return this;
    }

    addStoreListeners() {
        return;
    }

    // getStore() {

    //     const {
    //         store,
    //     } = this;

    //     if (!store) {
    //         throw new Error("Store has not been set");
    //     }

    //     return store;

    // }

    save() {
        this.store.save();
    }

}
