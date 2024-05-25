import Model from "./Model";
import {
    IScript,
    IMetaEntry,
    IMinimumRole,
} from "../types/types";

export default class ScriptModel extends Model<{
    "script-set": IScript,
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

    relayEvents() {

        const {
            store,
        } = this;

        // TODO: make this work - `this.store` won't exist at this point.
        // store.on("script-set", (data) => this.trigger("script-set", data));

    }

    getScripts(): Record<string, IMetaEntry> {

        const constructor = this.constructor as typeof ScriptModel;
        const scripts = Object.create(null);

        return Object
            .entries(this.store.getData("scripts"))
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

    setScript(script: IScript) {

        const {
            store,
        } = this;

        store.resetAugments();

        const constructor = this.constructor as typeof ScriptModel;
        const clone = [...script];
        const metaIndex = clone.findIndex((entry) => {
            return constructor.isMetaEntry(entry);
        });
        const meta = (
            metaIndex > -1
            ? clone.splice(metaIndex, 1)[0]
            : null
        );
        const ids = clone.map((entry) => {

            if (typeof entry === "string") {
                return entry;
            }

            if (constructor.isObjectId(entry)) {
                return entry.id;
            }

            if (constructor.isRole(entry)) {

                store.addAugment(entry.id, entry);
                return entry.id;

            }

            return null;

        });

        store.setData("script", [meta, ...ids].filter(Boolean));

    }

    setScriptById(id: string) {

        const scripts = this.store.getData("scripts");

        if (!Object.hasOwn(scripts, id)) {
            throw new ReferenceError(`Unrecognised script ID "${id}"`);
        }

        this.setScript(scripts[id]);

    }

}

