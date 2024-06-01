import Observer from "../utilities/Observer";
import Store from "../store/Store";

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
