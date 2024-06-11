import {
    IScriptValidatorCheck,
} from "../types/classes";
import {
    IRole,
} from "../types/data";

export default [

    {
        id: "scriptcheckisarray",
        test(roles: unknown) {
            return Array.isArray(roles);
        },
        message: "The script should contain an array of roles or IDs",
    },

    {
        id: "scriptcheckhasroles",
        test(roles: IRole[]) {
            return roles.length > 0;
        },
        message: "There are no roles",
    },

    {
        id: "scriptcheckrequiredkeys",
        test(roles: IRole[], [keys]: [string[]]) {

            const missing = roles.find((role) => {
                return !keys.every((key) => Object.hasOwn(role, key));
            });

            return !missing;

        },
        message: "Each role needs at least the following keys: {0}",
        params: [["id", "name", "ability", "team"]],
    },

    {
        id: "scriptcheckrequiredteams",
        test(roles: IRole[], [required]: [string[]]) {

            const teams = Object.fromEntries(
                required.map((team) => [team, 0])
            );

            roles.forEach(({ team }) => {

                if (Object.hasOwn(teams, team)) {
                    teams[team] += 1;
                }

            });

            return !Object.values(teams).includes(0);

        },
        message: "There must be at least 1 role for each of these teams: {0}",
        params: [["townsfolk", "outsider", "minion", "demon"]],
    },

    {
        id: "scriptcheckrecognisedteams",
        test(roles: IRole[], [recognised]: [string[]]) {
            return !roles.find(({ team }) => !recognised.includes(team));
        },
        message: "An unrecognised team was given - these are the only recognised teams: {0}",
        params: [["townsfolk", "outsider", "minion", "demon", "fabled", "traveler"]],
    },

] as IScriptValidatorCheck[];
