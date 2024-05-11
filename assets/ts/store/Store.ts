import {
    IMeta,
    IStore,
    IRole,
    IStoreEvents,
} from "../types/types";
import {
    deepClone,
} from "../utilities/objects";
import Observer from "../utilities/Observer";
import {
    defers,
} from "../utilities/global";

// NOTE: Maybe this should be a Model and everything else should be a ViewModel?
export default class Store extends Observer<IStoreEvents> {

    // protected static instance: Store;

    // static get() {

    //     if (!this.instance) {
    //         this.instance = new this();
    //     }

    //     return this.instance;

    // }

    static get KEY() {
        return "pg";
    }

    protected store: IStore;

    constructor() {

        super();

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
            scripts: {
                meta: {
                    ignore: true,
                },
                data: Object.create(null),
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

        return Promise.all([
            defers.roles,
            defers.scripts,
        ]).then(([
            roles,
            scripts,
        ]) => {

            // NOTE: It would be nice if the data didn't need changing here.
            this.setData(
                "roles",
                Object.fromEntries(roles.map((role) => [role.id, role])),
            );
            this.setData("scripts", scripts);

        });

        // const constructor = this.constructor as typeof Store;
        // const raw = window.localStorage.getItem(constructor.KEY);

        // if (raw === null) {
        //     return;
        // }

        // const data = JSON.parse(raw);

        // Object
        //     .entries(data)
        //     .forEach(<K extends keyof IStore>([key, value]: [K, IStore[K]["data"]]) => {
        //         this.setData(key, value);
        //     });

        // return data;

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

    private setInternalData<K extends keyof IStore>(key: K, data: IStore[K]["data"]) {
        this.store[key].data = data;
    }

    setData<K extends keyof IStore>(key: K, data: IStore[K]["data"]) {

        this.setInternalData(key, data);
        this.trigger(`${key}-set`, data);

    }

    getData<K extends keyof IStore>(key: K): IStore[K]["data"] {
        return deepClone(this.store[key].data);
    }

    resetAugments() {
        this.setInternalData("augments", Object.create(null));
    }

    addAugment(id: string, augment: Partial<IRole>) {

        const augments = this.getData("augments");

        augments[id] = augment;

        this.setInternalData("augments", augments);

    }

}
