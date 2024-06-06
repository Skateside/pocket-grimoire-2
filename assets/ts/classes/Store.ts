import {
    IPG,
    IStore,
    IStoreEntries,
    IStoreEvents,
    IRole,
} from "../types/types";
import {
    deepClone,
    update,
} from "../utilities/objects";
import Observer from "./Observer";
import StoreEntry from "./StoreEntry";
import StoreEntryUnsavable from "./StoreEntryUnsavable";
import StoreEntryInfo from "./StoreEntryInfo";

export default class Store extends Observer<IStoreEvents> {

    static get KEY() {
        return "pg";
    }

    protected store: IStoreEntries;

    constructor() {

        super();

        this.store = {
            i18n: new StoreEntryUnsavable<IStore["i18n"]>({}),
            roles: new StoreEntryUnsavable<IStore["roles"]>({}),
            augments: new StoreEntry<IStore["augments"]>({}),
            script: new StoreEntry<IStore["script"]>([]),
            scripts: new StoreEntryUnsavable<IStore["scripts"]>({}),
            seats: new StoreEntryUnsavable<IStore["seats"]>([]),
            reminders: new StoreEntryUnsavable<IStore["reminders"]>([]),
            infos: new StoreEntryInfo<IStore["infos"]>([]),
        };

    }

    ready() {

        const PG = (window as any).PG as IPG;
        const {
            i18n,
            roles,
            scripts,
            infos,
        } = this.store;

        i18n.setData(PG.i18n);
        roles.setData(
            Object.fromEntries(PG.roles.map((role) => [role.id, role]))
        );
        scripts.setData(PG.scripts);
        infos.setData(PG.infos);

        const constructor = this.constructor as typeof Store;
        const stored = JSON.parse(window.localStorage.getItem(constructor.KEY));

        Object
            .entries(stored || {})
            .forEach(<K extends keyof IStore>([key, data]: [K, IStore[K]]) => {

                const ref = this.store[key];
                
                ref.setData(ref.load(data));

            });

    }

    private read() {

        const constructor = this.constructor as typeof Store;
        const stored = JSON.parse(
            window.localStorage.getItem(constructor.KEY) || "{}"
        );

        return stored as Partial<IStore>;

    }

    private write(data: Partial<IStore>) {

        const constructor = this.constructor as typeof Store;
        window.localStorage.setItem(constructor.KEY, JSON.stringify(data));

    }

    update(data: Partial<IStore>) {
        // NOTE: Potential future bug - this will override data for arrays.
        this.write(update(this.read(), data));
    }

    save(key: keyof IStore) {

        const saved = this.store[key].save();

        if (!saved) {
            return;
        }

        this.update({ [key]: saved });

    }

    saveAll() {

        Object.keys(this.store).forEach((key) => {
            this.save(key as keyof IStore);
        });

    }

    load<K extends keyof IStore>(key: K) {
        return this.store[key].load(this.read()[key] as IStore[K]);
    }

    loadAll() {

        return Object.fromEntries(
            Object.keys(this.store).map((key) => [
                key,
                this.load(key as keyof IStore)
            ])
        );

    }

    reset(key: keyof IStore) {

        this.update({
            [key]: this.store[key].reset(),
        });

    }

    resetAll() {

        Object.keys(this.store).forEach((key) => {
            this.reset(key as keyof IStore);
        });

    }

    setData<K extends keyof IStore>(key: K, data: IStore[K]) {

        this.store[key].setData(data);
        this.save(key);
        this.trigger(`${key}-set`, data as IStoreEvents[`${K}-set`]);

    }

    getData<K extends keyof IStoreEntries>(key: K) {
        return this.store[key].getData();
    }

    extendData<K extends keyof IStore>(key: K, extend: Partial<IStore[K]>) {

        const store = this.store[key];

        // NOTE: Potential future bug - this will override data for arrays.
        store.setData(update(store.getData(), extend));

    }

    getMechanicalRoleIds() {

        return Object.entries(this.store.roles.getData())
            .filter(([ignore, role]) => this.isMechanicalRole(role))
            .map(([id]) => id);

    }

    isMechanicalRole(role: IRole) {
        return role.edition === "-pg-";
    }

    getRole(id: string) {

        const roles = this.store.roles.getData();
        const augments = this.store.augments.getData();

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
