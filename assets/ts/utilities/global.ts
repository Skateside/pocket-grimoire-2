import { defer } from "./promises";
import {
    IRole,
    IScripts,
} from "../types/types";

export const defers = {
    roles: defer<IRole[]>(),
    scripts: defer<IScripts>(),
};

export default {
    setRoles(roles: IRole[]) {
        defers.roles.resolve(roles);
    },
    setScripts(scripts: IScripts) {
        defers.scripts.resolve(scripts);
    }
};
