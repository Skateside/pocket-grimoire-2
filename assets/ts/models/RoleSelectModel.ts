import type {
    IScriptByTeam,
    ITeam,
    IRole,
} from "../types/data";
import Model from "./Model";
import ScriptModel from "./ScriptModel";

export default class RoleSelectModel extends Model<{
    "script-set": Partial<IScriptByTeam>,
}> {

    ready() {

        this.store.on("script-set", () => {
            this.trigger("script-set", this.getScriptByTeam());
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

    getScriptByTeam(): Partial<IScriptByTeam> {

        const script = this.store.getData("script");

        if (!script || !script.length) {
            return {};
        }

        return Object.groupBy(
            script.filter((entry) => ScriptModel.isRole(entry)),
            ({ team }) => team,
        );

    }

}
