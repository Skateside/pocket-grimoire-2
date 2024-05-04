import {
    IMeta,
    IStore,
} from "../types/types";
import {
    deepClone,
} from "../utilities/objects";

// NOTE: Maybe this should be a Model and everything else should be a ViewModel?
export default class Store {

    protected static instance: Store;

    static get() {

        if (!this.instance) {
            this.instance = new this();
        }

        return this.instance;

    }

    static get KEY() {
        return "pg";
    }

    protected store: IStore;

    constructor() {

        this.store = {
            roles: {
                meta: {
                    ignore: true,
                },
                data: Object.create(null),
            },
            augments: {
                meta: Object.create(null),
                data: Object.create(null),
            },
            script: {
                meta: Object.create(null),
                data: [],
            },
            seats: {
                meta: Object.create(null),
                data: [],
            },
            reminders: {
                meta: Object.create(null),
                data: [],
            },
        };

    }

    load() {

        const constructor = this.constructor as typeof Store;
        const raw = window.localStorage.getItem(constructor.KEY);

        if (raw === null) {
            return;
        }

        const data = JSON.parse(raw);

        Object
            .entries(data)
            .forEach(<K extends keyof IStore>([key, value]: [K, IStore[K]["data"]]) => {
                this.setData(key, value);
            });

        return data;

    }

    save() {

        const constructor = this.constructor as typeof Store;
        const data = Object.fromEntries(
            Object.entries(this.store)
                .filter(([key, entry]) => !entry.meta.ignore)
                .map(([key, entry]) => [key, entry.data])
        );

        window.localStorage.setItem(constructor.KEY, JSON.stringify(data));

    }

    setMeta(key: keyof IStore, meta: Partial<IMeta>) {
        this.store[key].meta = meta;
    }

    getMeta(key: keyof IStore) {
        return deepClone(this.store[key].meta);
    }

    setData<K extends keyof IStore>(key: K, data: IStore[K]["data"]) {
        this.store[key].data = data;
        // TODO: trigger an event here.
    }

    getData(key: keyof IStore) {
        return deepClone(this.store[key].data);
    }

}
