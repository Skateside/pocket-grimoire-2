import Observer from "../classes/Observer";
import Store from "../classes/Store";

export default class Model<EventMap = {}> extends Observer<EventMap> {

    protected store: Store;

    constructor(store: Store) {

        super();
        this.store = store;

    }

    addStoreListeners() {
        return;
    }

    ready() {

        this.addStoreListeners();

    }

}
