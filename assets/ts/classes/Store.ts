import type {
    INumeric,
} from "../types/utilities";
import type {
    IPG,
    IStore,
    IStoreEvents,
    IRole,
} from "../types/data";
import type {
    IStoreEntries,
    IObservable,
    ObserverHandler,
} from "../types/classes";
import Observer from "./Observer";
import StoreEntry from "./StoreEntry/StoreEntry";
import Unsavable from "./StoreEntry/Unsavable";
import Info from "./StoreEntry/Info";
import {
    update,
} from "../utilities/objects";
import defaultSettings from "../data/settings";
import gameData from "../data/game";

export default class Store implements IObservable<IStoreEvents> {

    static get KEY() {
        return "pg";
    }

    protected store: IStoreEntries;
    protected observer: Observer<IStoreEvents>;

    constructor() {

        this.store = {
            // Default settings for the application.
            settings: new Unsavable<IStore["settings"]>({}),
            // The numbers of townsfolk/outsiders etc. for the number of players.
            game: new Unsavable<IStore["game"]>({}),
            // Any localised texts.
            i18n: new Unsavable<IStore["i18n"]>({}),
            // Players that have been created.
            players: new StoreEntry<IStore["players"]>({}),
            // Full data for the official roles.
            roles: new Unsavable<IStore["roles"]>({}),
            // Data for any homebrew roles or updates to official roles.
            augments: new StoreEntry<IStore["augments"]>({}),
            // The current script - an array of roles and the meta entry.
            script: new StoreEntry<IStore["script"]>([]),
            // The official scripts - a record of the script ID vs. role IDs and the meta entry.
            scripts: new Unsavable<IStore["scripts"]>({}),
            // Full data for any info tokens.
            infos: new Info<IStore["infos"]>([]),
            // A record of CSS selectors to values for the inputs.
            inputs: new StoreEntry<IStore["inputs"]>({}),
            // seats: new Unsavable<IStore["seats"]>([]),
            // reminders: new Unsavable<IStore["reminders"]>([]),
        };

    }

    setObserver(observer: Observer<IStoreEvents>) {
        this.observer = observer;
        return this;
    }

    on<K extends keyof IStoreEvents>(
        eventName: K,
        handler: ObserverHandler<IStoreEvents[K]>,
    ): void {
        return this.observer.on(eventName, handler);
    }

    off<K extends keyof IStoreEvents>(
        eventName: K,
        handler: ObserverHandler<IStoreEvents[K]>,
    ): void {
        return this.observer.off(eventName, handler);
    }

    trigger<K extends keyof IStoreEvents>(
        eventName: K,
        detail: IStoreEvents[K],
    ): void {
        return this.observer.trigger(eventName, detail);
    }

    ready() {

        // Load data from the localised data.

        const PG = (window as any).PG as IPG;
        const {
            settings,
            game,
            i18n,
            players,
            roles,
            scripts,
            infos,
        } = this.store;

        settings.setData(defaultSettings);
        game.setData(gameData);
        i18n.setData(PG.i18n);
        players.setData({
            count: defaultSettings.startingPlayers,
            names: [],
        });
        roles.setData(
            Object.fromEntries(PG.roles.map((role) => [role.id, role]))
        );
        scripts.setData(PG.scripts);
        infos.setData(PG.infos);

        // Load data from localStorage.

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

    update<K extends keyof IStore>(key: K, data: Partial<IStore[K]>) {

        // NOTE: Potential future bug - this will override data for arrays.
        const existing = this.read();

        if (Object.hasOwn(existing, key)) {
            update(existing[key], data);
        } else {
            existing[key] = data as IStore[K];
        }

        this.write(existing);

    }

    save(key: keyof IStore) {

        const saved = this.store[key].save();

        if (!saved) {
            return;
        }

        this.update(key, saved);

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
        this.update(key, this.store[key].reset());
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

    getNumbers(players: INumeric) {

        let playerCount = Math.floor(players as number);

        if (Number.isNaN(playerCount)) {
            throw new TypeError(`Unrecognised player count type: ${players}`);
        }

        if (playerCount < 5 || playerCount > 20) {

            throw new RangeError(
                `Player count must be between 5 and 20 - ${playerCount} given`
            );

        }

        if (playerCount > 15) {
            playerCount = 15;
        }

        return this.store.game.getData()[playerCount];

    }

    getMechanicalRoleIds() {

        return Object.values(this.store.roles.getData())
            .filter((role) => this.isMechanicalRole(role))
            .map(({ id }) => id);

    }

    isMechanicalRole(role: IRole) {
        return role.edition === "-pg-";
    }

    getRole(id: string) {

        const roles = this.store.roles.getData();
        const augments = this.store.augments.getData();

        if (!Object.hasOwn(roles, id) && !Object.hasOwn(augments, id)) {
            throw new ReferenceError(`Unable to identify role with ID "${id}"`);
        }

        const role = structuredClone(roles[id] || {}) as IRole;
        const augment = structuredClone(augments[id] || {});

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
