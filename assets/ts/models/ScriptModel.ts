import Model from "./Model";
import Store from "../classes/Store";
import {
    IRole,
    IScript,
    IMetaEntry,
    IMinimumRole,
} from "../types/types";

export default class ScriptModel extends Model<{
    // "script-set": IScript,
}> {

    static isMetaEntry(entry: any): entry is IMetaEntry {
        return entry && typeof entry === "object" && entry.id === "_meta";
    }

    static isRole(entry: any): entry is IMinimumRole {

        return (
            entry
            && typeof entry === "object"
            && typeof entry.id === "string"
            && entry.id !== "_meta"
        );

    }

    static isObjectId(entry: any) {
        return this.isRole(entry) && Object.keys(entry).length === 1;
    }

    // NOTE: The ScriptController probably doesn't need to know that the script
    // has been selected.
    // addStoreListeners(): void {

    //     const {
    //         store,
    //     } = this;

    //     store.on("script-set", (script) => this.trigger("script-set", script));

    // }

    getScripts(): Record<string, IMetaEntry> {

        const constructor = this.constructor as typeof ScriptModel;
        const allScripts = this.store.getData("scripts");

        return Object
            .entries(allScripts)
            .reduce((scripts, [id, script]) => {

                const metaIndex = script.findIndex((entry) => {
                    return constructor.isMetaEntry(entry);
                });

                if (metaIndex > -1) {
                    scripts[id] = script[metaIndex];
                }

                return scripts;

            }, Object.create(null));

    }

    static extractMeta(script: IScript) {

        const metaIndex = script.findIndex((entry) => {
            return this.isMetaEntry(entry);
        });

        return (
            metaIndex > -1
            ? script.splice(metaIndex, 1)[0]
            : {
                id: "_meta",
                name: "",
            }
        )  as IMetaEntry;

    }

    static identifyRoles(script: IScript, store: Store) {

        const ids = script.map((entry) => {

            if (typeof entry === "string") {
                return entry;
            }

            if (this.isObjectId(entry)) {
                return entry.id;
            }

            if (this.isRole(entry)) {

                store.addAugment(entry.id, entry);
                return entry.id;

            }

            return null;

        }).filter(Boolean);

        store.getMechanicalRoleIds().forEach((id) => {

            if (!ids.includes(id)) {
                ids.push(id);
            }

        });

        return ids.map((id) => store.getRole(id));

    }

    static createNightOrder(
        roles: IRole[],
        type: "firstNight" | "otherNight",
    ): string[] {

        return roles
            .filter((role) => role[type] > 0)
            .sort((roleA, roleB) => roleA[type] - roleB[type])
            .map(({ id }) => id);

    }

    static setNightOrder(meta: IMetaEntry, roles: IRole[]) {

        meta.firstNight = (
            meta.firstNight || this.createNightOrder(roles, "firstNight")
        );
        meta.otherNight = (
            meta.otherNight || this.createNightOrder(roles, "otherNight")
        );

        return meta;

    }

    setScript(script: IScript) {

        const {
            store,
        } = this;

        store.resetAugments();

        const constructor = this.constructor as typeof ScriptModel;
        const clone = [...script];
        const meta = constructor.extractMeta(clone);
        const roles = constructor.identifyRoles(clone, store);

        constructor.setNightOrder(meta, roles);
        store.setData(
            "script",
            [meta, ...roles.filter((role) => !store.isMechanicalRole(role))],
        );

    }

    setScriptById(id: string) {

        const scripts = this.store.getData("scripts");

        if (!Object.hasOwn(scripts, id)) {
            throw new ReferenceError(`Unrecognised script ID "${id}"`);
        }

        this.setScript(scripts[id]);

    }

}

