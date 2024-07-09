import type {
    IScriptByTeam,
    IRole,
} from "../types/data";
import Model from "./Model";
import ScriptModel from "./ScriptModel";

export default class RoleSelectModel extends Model<{
    "script-set": Partial<IScriptByTeam>,
    "player-count-update": number,
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

    getScriptByTeam(): Partial<IScriptByTeam> {

        const script = this.store.getData("script");

        if (!script || !script.length) {
            return {};
        }

        // Type-casting is needed to get around a ts(2339) that doesn't realise
        // that we've filtered out the meta entry.
        return Object.groupBy(
            script.filter((entry) => ScriptModel.isRole(entry)) as IRole[],
            ({ team }) => team,
        );

    }

}
