import {
    IRole,
    IScript,
    // IScripts,
    IJinx,
} from "../types/types";
import Model from "../models/Model";
import {
    defers,
} from "../utilities/global";
import ViewModel from "../viewmodels/ViewModel";
import {
    matches,
    deepClone,
} from "../utilities/objects";

type IRoleMeta = {
    role: IRole,
    origin: "official" | "homebrew" | "augment",
    // scriptPosition: number,
    augment?: Partial<IRole>,
};

class RoleModel extends Model<{
}> {

    protected meta: IRoleMeta[];

    static enwrapRole(role: IRole, options: Partial<IRoleMeta> = {}): IRoleMeta {

        return {
            role,
            origin: "official",
            // scriptPosition: -1,
            // inPlay: 0,
            // inBag: 0,
            ...options,
        };

    }

    static makeEmptyRole(): IRole {

        return {
            id: "",
            team: "outsider",
            name: "",
            ability: "",
            edition: "",
            image: "#",
            firstNight: 0,
            firstNightReminder: "",
            otherNight: 0,
            otherNightReminder: "",
            setup: false,
            reminders: [],
        };

    }

    static getRole(meta: IRoleMeta): IRole {

        const {
            role,
            origin,
            augment,
        } = meta;

        const data = deepClone(role);

        if (origin !== "augment" || !augment) {
            return data;
        }

        const cloneAugment = deepClone(augment);
        const jinxes = cloneAugment.jinxes;
        delete cloneAugment.jinxes;
        Object.assign(data, cloneAugment);

        if (jinxes) {
            data.jinxes = this.mergeJinxes(data.jinxes || [], jinxes);
        }

        return data;

    }

    static mergeJinxes(source: IJinx[], augment: IJinx[]): IJinx[] {

        return augment.reduce((merged, { id, reason }) => {

            let index = merged.findIndex(({ id: mergedId }) => id === mergedId);

            if (index < 0) {
                index = merged.length;
            }

            merged[index] = {
                id,
                reason,
                state: "theoretical",
            };

            return merged;

        }, source);

    }

    constructor() {
        super();
        this.meta = [];
    }

    load(): Promise<void> {
        
        return Promise.all([
            defers.roles,
        ]).then(([
            roles,
        ]) => {
        });

    }

    findDataIndex(search: Partial<IRole>): number {
        return this.meta.findIndex(({ role }) => matches(search, role));
    }

    findData(search: Partial<IRole>): IRoleMeta | undefined {
        return this.meta[this.findDataIndex(search)];
    }

    addOfficialRole(role: IRole) {

        const {
            meta,
        } = this;
        const constructor = this.constructor as typeof RoleModel;
        const {
            id,
        } = role;
        let index = (
            id
            ? this.findDataIndex({ id })
            : meta.length
        );

        if (index < 0) {
            index = meta.length;
        }

        meta[index] = constructor.enwrapRole(role);

    }

    addHomebrewRole(role: Partial<IRole>) {

        const {
            meta,
        } = this;
        const constructor = this.constructor as typeof RoleModel;
        const index = this.findDataIndex({ id: role.id });

        if (index < 0) {

            meta.push(
                constructor.enwrapRole({
                    ...constructor.makeEmptyRole(),
                    ...role
                }, {
                    origin: "homebrew",
                })
            );

        } else {

            // NOTE: possible future bug
            // If someone uploads the same homebrew character twice, we might
            // end up augmenting a homebrew character, causing it to seem
            // official if the repository is reset.

            meta[index] = {
                ...meta[index],
                ...{
                    origin: "augment",
                    augment: role,
                }
            };

        }

    }

    setScript(script: IScript) {

        this.meta.forEach((data) => {

            // data.scriptPosition = -1;
            data.role.jinxes?.forEach((jinx) => jinx.state = "theoretical");

        });

        const roles: Record<string, IRole> = Object.create(null);

        script.forEach((reference, index) => {

            const id = (
                typeof reference === "string"
                ? reference
                : reference.id
            );
            const data = this.findData({ id });

            if (!data) {
                return;
            }

            // data.scriptPosition = index;

            const {
                role,
            } = data;

            roles[role.id] = role;

        });

        const ids = Object.keys(roles);
        Object.values(roles).forEach((role) => {

            role.jinxes?.forEach((jinx) => {

                if (ids.includes(jinx.id)) {
                    jinx.state = "potential";
                }

            });

        });

    }

}

type IScriptsCollection = Record<string, IScript>;

class ScriptModel extends Model<{
    "script-set": IScript,
}> {

    protected scripts: IScriptsCollection;
    protected script: IScript;

    constructor() {
        super();
        this.scripts = Object.create(null);
        this.script = [];
    }

    load(): Promise<void> {

        return Promise.all([
            defers.scripts,
        ]).then(([
            scripts,
        ]) => {
            this.setScripts(scripts);
        });

    }

    setScripts(scripts: IScriptsCollection) {
        Object.assign(this.scripts, scripts);
    }

    setScript(script: IScript) {

        this.script = script;
        this.trigger("script-set", script);

    }

    getScript() {
        return this.script;
    }

}

class RoleScriptViewModel extends ViewModel<{
    role: RoleModel,
    script: ScriptModel,
}> {

    ready(): void {
        
        const {
            role: roleModel,
            script: scriptModel,
        } = this.models;

        scriptModel.on("script-set", (script) => {
            roleModel.setScript(script);
        });

    }

    // TODO: handle the roles and jinxes in this object, rather than RoleModel.

}
