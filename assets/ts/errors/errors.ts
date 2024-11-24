export class PocketGrimoireError extends Error {

    public readonly isPGError: true;

    constructor(message?: string) {

        super(message);
        this.name = "PocketGrimoireError";

        Object.defineProperty(this, "isPGError", {
            value: true,
        });

    }

}

// findOrDie()
export class CannotFindElementError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "CannotFindElementError";
    }

}

// findOrDie()
export class MissingRootError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "MissingRootError";
    }

}

// ScriptView#showCustomError()
export class NoActiveFieldError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "ScriptViewNoActiveFieldError";
    }

}

// Store#getNumbers()
export class NonNumericError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "NonNumericError";
    }

}

// Store#getNumbers()
export class OutOfRangePlayerCountError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "OutOfRangePlayerCountError";
    }

}

// RoleSelectView#tickRoles()
export class StrangeRolesError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "StrangeRolesError";
    }

}

// Store#getRole()
export class UnrecognisedRoleError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "UnrecognisedRoleError";
    }

}

// ScriptModel#setScriptById()
export class UnrecognisedScriptError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "UnrecognisedScriptError";
    }

}

// RoleSelectView#updateTeamCount()
export class UnrecognisedTeamError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "UnrecognisedTeamError";
    }

}

// GrimoireController#render()
export class UnsetMovablesError extends PocketGrimoireError {

    constructor(message?: string) {
        super(message);
        this.name = "UnsetMovablesError";
    }

}
