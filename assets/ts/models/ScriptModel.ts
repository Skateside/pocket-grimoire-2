import Model from "./Model";
import Store from "../classes/Store";
import ScriptValidator from "../classes/ScriptValidator";
import {
    IRole,
    IScript,
    IMetaEntry,
    IMinimumRole,
} from "../types/data";

export default class ScriptModel extends Model<{
    "script-error": string,
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

    protected validator: ScriptValidator;

    ready() {

        super.ready();
        this.validator = new ScriptValidator();
        this.validator.setMessages(this.store.getData("i18n"));

    }

    // isOffline() {
    //     return this.store.getData("config").offline;
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

        if (!Array.isArray(script)) {
            return;
        }

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

        if (!Array.isArray(script)) {
            return;
        }

        const ids = script.map((entry) => {

            if (typeof entry === "string") {
                return entry;
            }

            if (this.isObjectId(entry)) {
                return entry.id;
            }

            if (this.isRole(entry)) {

                store.extendData("augments", { [entry.id]: entry })
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

    static setJinxStates(roles: IRole[]) {

        const ids = roles.map(({ id }) => id);

        roles.forEach(({ jinxes }) => {

            if (!jinxes || !jinxes.length) {
                return;
            }

            jinxes.forEach((jinx) => {

                jinx.state = (
                    ids.includes(jinx.id)
                    ? "potential"
                    : "theoretical"
                );

            });

        });

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

        const ids = roles.map(({ id }) => id);

        ["firstNight", "otherNight"].forEach(
            <K extends "firstNight" | "otherNight">(type: K) => {

                meta[type] = (
                    meta[type] || this.createNightOrder(roles, type)
                ).filter((id) => ids.includes(id));

            }
        );

        return meta;

    }

    setScript(script: IScript) {

        const {
            store,
        } = this;

        const augments = store.getData("augments");
        store.reset("augments");

        const constructor = this.constructor as typeof ScriptModel;
        const meta = constructor.extractMeta(script);
        const roles = constructor.identifyRoles(script, store);
        const test = this.validator.test(roles);

        if (typeof test === "string") {

            store.update("augments", augments);
            this.trigger("script-error", test);
            return;

        }

        constructor.setJinxStates(roles);
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
