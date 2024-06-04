import {
    IPG,
    IMeta,
    IStore,
    IStoreEntries,
    IStoreEvents,
    IRole,
    IInfoToken,
} from "../types/types";
import {
    deepClone,
} from "../utilities/objects";
import Observer from "./Observer";

export default class Store extends Observer<IStoreEvents> {

    static get KEY() {
        return "pg";
    }

    protected store: IStoreEntries;

    constructor() {

        super();

        this.store = {
            i18n: {
                meta: {
                    ignore: true,
                },
                data: Object.create(null),
            },
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
            infos: {
                meta: {
                    filter(entry) {
                        return (entry as IInfoToken).type === "custom";
                    },
                    load(current, stored) {
                        return current.concat(...stored);
                    }
                },
                data: [],
            },
        };

    }

    load() {

        const PG = (window as any).PG as IPG;

        this.setInternalData("i18n", PG.i18n);
        this.setInternalData(
            "roles",
            Object.fromEntries(PG.roles.map((role) => [role.id, role])),
        );
        this.setInternalData("scripts", PG.scripts);
        this.setInternalData("infos", PG.infos);

        const constructor = this.constructor as typeof Store;
        const stored = JSON.parse(window.localStorage.getItem(constructor.KEY));

        Object
            .entries(stored || {})
            .forEach(<K extends keyof IStore>([key, data]: [K, IStore[K]]) => {

                const ref = this.store[key];

                if (ref.meta.load) {

                    this.setInternalData(
                        key,
                        ref.meta.load(this.getData(key) as IStore[K], data)
                    );

                }

            });

    }

    save() {

        const constructor = this.constructor as typeof Store;
        const data = Object.fromEntries(
            Object.entries(this.store)
                .filter(([key, entry]) => !entry.meta.ignore)
                .map(([key, entry]) => [
                    key,
                    (
                        (Array.isArray(entry.data) && entry.meta.filter)
                        ? entry.data.filter(entry.meta.filter)
                        : entry.data
                    ),
                ])
        );

        window.localStorage.setItem(constructor.KEY, JSON.stringify(data));

    }

    setMeta(key: keyof IStoreEntries, meta: IMeta) {
        this.store[key].meta = meta;
    }

    getMeta(key: keyof IStoreEntries) {
        return deepClone(this.store[key].meta);
    }

    private setInternalData<K extends keyof IStoreEntries>(
        key: K,
        data: IStoreEntries[K]["data"],
    ) {
        this.store[key].data = data as IStore[K];
    }

    setData<K extends keyof IStoreEntries>(
        key: K,
        data: IStoreEntries[K]["data"],
    ) {

        this.setInternalData(key, data as IStore[K]);
        this.save();
        this.trigger(`${key}-set`, data);

    }

    getData<K extends keyof IStoreEntries>(key: K): IStoreEntries[K]["data"] {
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

    getMechanicalRoleIds() {

        return Object.entries(this.store.roles.data)
            .filter(([ignore, { edition }]) => edition === "-pg-")
            .map(([id]) => id);

    }

    isMechanicalRole(role: IRole) {
        return role.edition === "-pg-";
    }

    getRole(id: string) {

        const roles = this.store.roles.data;
        const augments = this.store.augments.data;

        if (!Object.hasOwn(roles, id)) {
            throw new ReferenceError(`Unable to identify role with ID "${id}"`);
        }

        const role = deepClone(roles[id]);
        const augment = deepClone(augments[id] || {});

        if (augment) {

            if (augment.jinxes) {

                role.jinxes = (role.jinxes || []).concat(...augment.jinxes);
                delete augment.jinxes;

            }

            Object.assign(role, augment);

        }

        return role;

    }

}