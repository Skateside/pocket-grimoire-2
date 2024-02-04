import {
    IRepository,
    IRole,
    IData,
    IJinx,
    ITeam,
    IRepositoryNights,
    IRepositoryNightsRoles
} from "../types/types";
import {
    deepClone,
    matches
} from "../utilities/objects";
import {
    fetchFromCache,
    fetchFromStorage,
    updateStorage
} from "../utilities/storage";
import Model from "./Model";

export default class RepositoryModel extends Model<{
    "script-update": null,
    "inplay-update": null
}> {

    protected repository: IRepository = [];

    static enwrapRole(role: IRole, options: Partial<IData> = {}): IData {

        return {
            role,
            origin: "official",
            inScript: false,
            inPlay: 0,
            ...options
        };

    }

    static makeEmptyRole(): IRole {

        return {
            id: "",
            team: "outsider",
            name: "",
            image: "#",
            firstNight: 0,
            firstNightReminder: "",
            otherNight: 0,
            otherNightReminder: "",
            setup: false,
            reminders: [],
        };

    }

    static getRoleData(datum: IData): IRole {

        const {
            role,
            origin,
            augment,
        } = datum;

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
                state: "theoretical"
            };

            return merged;

        }, source);

    }

    constructor() {

        super();
        this.repository = [];

    }

    load(locale: string) {

        return Promise.all([
            fetchFromCache<IRole[]>(`./assets/data/${locale}.json`),
            fetchFromStorage("repository")
        ]).then(([
            roles,
            repository
        ]) => {

            this.setRoles(roles);
            this.setRepositoryInfo(repository);

        });

    }

    setRoles(roles: IRole[]) {
        roles.forEach((role) => this.addOfficialRole(role));
    }

    // loadRepository(repository: (Partial<IData> & Pick<IData, "role" | "inScript" | "inPlay">)[]) {
    setRepositoryInfo(repository: Partial<IData>[]) {

        repository.forEach((repoInfo) => {

            if (repoInfo.origin === "homebrew") {
                this.addHomebrewRole(repoInfo.role);
            } else if (repoInfo.origin === "augment") {
                this.addHomebrewRole(repoInfo.augment);
            }

            const data = this.findData({ id: repoInfo.role.id });
            data.inScript = repoInfo.inScript;
            data.inPlay = repoInfo.inPlay;

        });

    }

    save() {

        const repository = this.repository.map((data) => {

            const repoInfo: Record<string, any> = {
                role: {
                    id: data.role.id
                },
                inScript: data.inScript,
                inPlay: data.inPlay
            };

            if (data.origin === "augment") {
                repoInfo.augment = data.augment;
            } else if (data.origin === "homebrew") {
                repoInfo.role = data.role;
            }

            return repoInfo;

        });

        updateStorage("repository", repository);

    }

    findDataIndex(search: Partial<IRole>): number {
        return this.repository.findIndex(({ role }) => matches(search, role));
    }

    findData(search: Partial<IRole>): IData | undefined {
        return this.repository[this.findDataIndex(search)];
    }

    addOfficialRole(role: IRole) {

        const {
            repository
        } = this;
        const constructor = this.constructor as typeof RepositoryModel;
        const {
            id
        } = role;
        let index = (
            id
            ? this.findDataIndex({ id })
            : repository.length
        );

        if (index < 0) {
            index = repository.length;
        }

        repository[index] = constructor.enwrapRole(role);

    }

    addHomebrewRole(role: Partial<IRole>) {

        const {
            repository
        } = this;
        const constructor = this.constructor as typeof RepositoryModel;
        const index = this.findDataIndex({ id: role.id });

        // Patch for the American spelling of "traveller".
        if ((role as any).team === "traveler") {
            role.team = "traveller";
        }

        if (index < 0) {

            repository.push(
                constructor.enwrapRole({
                    ...constructor.makeEmptyRole(),
                    ...role
                }, {
                    origin: "homebrew"
                })
            );

        } else {

            // NOTE: possible future bug
            // If someone uploads the same homebrew character twice, we might
            // end up augmenting a homebrew character, causing it to seem
            // official if the repository is reset.

            repository[index] = {
                ...repository[index],
                ...{
                    origin: "augment",
                    augment: role
                }
            };

        }

    }

    getRoles() {

        return Object.fromEntries(
            this.repository.map(({ role }) => [
                role.id, role
            ])
        );

    }

    resetRepository() {

        const {
            repository
        } = this;
        let index = repository.length;

        while (index) {

            index -= 1;
            const data = repository[index];

            data.inPlay = 0;
            data.inScript = false;

            if (data.origin === "augment") {

                data.origin = "official";
                delete data.augment;

            } else if (data.origin === "homebrew") {
                repository.splice(index, 1);
            }

        }

    }

    setScript(script: (Partial<IRole> & Pick<IRole, "id">)[]) {

        this.repository.forEach((data) => {

            data.inScript = false;
            data.role.jinxes?.forEach((jinx) => jinx.state = "theoretical");

        });

        const roles: Record<string, IRole> = Object.create(null);

        script.forEach(({ id }) => {

            const data = this.findData({ id });

            if (!data) {
                return;
            }

            data.inScript = true;

            const {
                role
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

    getScript() {
        return this.repository.filter(({ inScript }) => inScript);
    }

    getScriptRoles() {

        const constructor = this.constructor as typeof RepositoryModel;

        return this.getScript().map((data) => constructor.getRoleData(data));

    }

    getInPlay() {
        return this.repository.filter(({ inPlay }) => inPlay > 0);
    }

    getInPlayRoles() {

        const constructor = this.constructor as typeof RepositoryModel;

        return this.getInPlay().map((data) => constructor.getRoleData(data));

    }

    getTeam(team: ITeam) {

        return Object.groupBy(
            this.repository.filter(({ role }) => role.team === team),
            (data: IData) => {
                return (
                    data.inScript
                    ? "in"
                    : "out"
                );
            }
        );

    }

    getTeamRoles(team: ITeam) {

        const constructor = this.constructor as typeof RepositoryModel;
        const inOut = this.getTeam(team);

        return {
            in: inOut.in.map((data) => constructor.getRoleData(data)),
            out: inOut.out.map((data) => constructor.getRoleData(data))
        };

    }

    getNight(script: IData[], type: keyof IRepositoryNights) {

        const constructor = this.constructor as typeof RepositoryModel;
        const night: Record<string, IData[]> = Object.create(null);

        script.forEach((data) => {

            const role = constructor.getRoleData(data);
            const nightOrder = role[`${type}Night`];

            if (nightOrder <= 0) {
                return;
            }

            if (!night[nightOrder]) {
                night[nightOrder] = [];
            }

            night[nightOrder].push(data);

        });

        return Object.entries(night)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .reduce((sorted, [ignore, data]) => {
                return sorted.concat(...data);
            }, [] as IData[]);

    }

    getScriptNights(): IRepositoryNights {

        const script = this.getScript();

        return {
            first: this.getNight(script, "first"),
            other: this.getNight(script, "other")
        };

    }

    getScriptNightsRoles(): IRepositoryNightsRoles {

        const constructor = this.constructor as typeof RepositoryModel;
        const nights = this.getScriptNights();

        return {
            first: nights.first.map((data) => constructor.getRoleData(data)),
            other: nights.other.map((data) => constructor.getRoleData(data))
        };

    }

}
