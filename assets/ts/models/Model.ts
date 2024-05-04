import Observer from "../utilities/Observer";
import Store from "../store/Store";

export default class Model<EventMap = {}> extends Observer<EventMap> {

    protected store: Store;

    constructor() {
        super();
        this.store = Store.get();
    }

    load() {
        return Promise.resolve();
    }

    save() {
        this.store.save();
    }

}
