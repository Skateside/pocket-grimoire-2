import type {
    IScriptByTeam,
    IRole,
    IGameNumbers,
    ISpecial,
    IRoleDisplay,
} from "../types/data";
import type {
    INumeric,
} from "../types/utilities";
import Model from "./Model";
import ScriptModel from "./ScriptModel";
import {
    shuffle,
} from "../utilities/arrays";

export default class RoleSelectModel extends Model<{
    "script-set": Partial<IScriptByTeam<IRoleDisplay>>,
    "player-count-update": number,
    "roles-randomised": string[],
}> {

    ready() {

        this.store.on("script-set", () => {
            this.trigger("script-set", this.getScriptByTeam());
        });

        this.store.on("players-set", ({ count }) => {
            this.trigger("player-count-update", count);
        });

    }

    getTexts() {

        const i18n = this.store.getData("i18n");

        return [
            ["townsfolk", i18n.grouptownsfolk],
            ["outsider", i18n.groupoutsider],
            ["minion", i18n.groupminion],
            ["demon", i18n.groupdemon],
            ["traveler", i18n.grouptraveler],
        ] as [string, string][];

    }

    getNumbers(players: number) {
        return this.store.getNumbers(players);
    }

    getPlayerCount() {
        return this.store.getData("players").count;
    }

    getScriptByTeam(): Partial<IScriptByTeam<IRoleDisplay>> {

        const script = this.store.getData("script");

        if (!script || !script.length) {
            return {};
        }

        const constructor = this.constructor as typeof RoleSelectModel;
        const filtered = script.filter((entry) => ScriptModel.isRole(entry));
        const converted = filtered.map((role) => constructor.convertRole(role));

        return Object.groupBy(converted, ({ team }) => team);

    }

    static getSpecial(
        role: IRole,
        [type, name]: [ISpecial["type"], ISpecial["name"]],
    ) {

        if (!Object.hasOwn(role, "special")) {
            return null;
        }

        return role.special.find(({ type: specialType, name: specialName }) => {
            return specialType === type && specialName === name;
        }) || null;

    }

    static hasSpecial(
        role: IRole,
        [type, name]: [ISpecial["type"], ISpecial["name"]],
    ) {
        return Boolean(this.getSpecial(role, [type, name]));
    }

    static convertRole(role: IRole) {

        return {
            id: role.id,
            name: role.name,
            ability: role.ability,
            team: role.team,
            image: role.image,
            isDisabled: this.hasSpecial(role, ["selection", "bag-disabled"]),
            isDuplicate: this.hasSpecial(role, ["selection", "bag-duplicate"]),
        } as IRoleDisplay;

    }

    getRandomRoleIds() {

        const numbers = this.getNumbers(this.getPlayerCount());
        const random: string[] = [];

        Object.entries(this.getScriptByTeam()).forEach(([team, roles]) => {

            const count = numbers[team as keyof IGameNumbers];

            if (!count) {
                return;
            }

            random.push(
                ...shuffle(roles.filter((role) => !role.isDisabled))
                    .slice(0, count)
                    .map(({ id }) => id)
            );

        });

        return random;

    }

    processBag(quantities: Record<string, INumeric>) {

        const quantity = Object.fromEntries(
            Object.entries(quantities)
                .map(([id, count]) => [id, Number(count)])
                .filter(([ignore, count]: [string, number]) => count > 0)
        );

        console.log({ quantities, quantity });
        // TODO: Do something with this.

    }

}
