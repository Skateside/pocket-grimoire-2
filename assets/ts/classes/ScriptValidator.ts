import {
    IScriptValidatorCheck,
} from "../types/classes";
import {
    IRole,
} from "../types/data";
import {
    supplant,
} from "../utilities/strings";
import scriptValidators from "../data/scriptValidators";

export default class ScriptValidator {

    static defaultChecks = scriptValidators;

    protected checks: IScriptValidatorCheck[];

    constructor() {

        this.checks = [];

        const constructor = this.constructor as typeof ScriptValidator;
        constructor.defaultChecks.forEach((check) => this.addCheck(check));

    }

    addCheck(check: IScriptValidatorCheck) {

        const {
            checks,
        } = this;
        let index = checks.findIndex(({ id }) => check.id == id);

        if (index < 0) {
            index = checks.length;
        }

        checks[index] = check;

    }

    getMessage(check: IScriptValidatorCheck) {
        return supplant(check.message,(check.params || []).map(String));
    }

    test(roles: IRole[]) {

        const failure = this.checks.find(({ test, params }) => {
            return !test(roles, params);
        });

        if (failure) {
            return this.getMessage(failure);
        }

        return true;

    }

    setMessages(messages: Record<string, string>) {

        Object.entries(messages).forEach(([id, message]) => {

            const check = this.checks.find((check) => check.id === id);

            if (!check) {
                return;
            }

            check.message = message;

        });

    }

}
