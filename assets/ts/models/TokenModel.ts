import {
    IRoleToken,
    IRole,
    IReminderToken,
    ICoordinates,
} from "../types/types";
import Model from "./Model";

export default class TokenModel extends Model {

    protected roles: IRoleToken[];
    protected reminders: IReminderToken[];

    constructor() {

        super();
        this.roles = [];
        this.reminders = [];

    }

    static enwrapRole(role: IRole): IRoleToken {

        return {
            role,
            coords: {
                x: 0,
                y: 0,
                z: 0,
            },
            name: "",
            isDead: false,
            isUpsideDown: false,
        };

    }

    static enwrapReminder(role: IRole, index: number): IReminderToken {

        return {
            role,
            index,
            coords: {
                x: 0,
                y: 0,
                z: 0,
            },
        };

    }

    addRole(role: IRole) {
        const constructor = this.constructor as typeof TokenModel;
        this.roles.push(constructor.enwrapRole(role));
    }

    addReminder(role: IRole, index: number) {
        const constructor = this.constructor as typeof TokenModel;
        this.reminders.push(constructor.enwrapReminder(role, index));
    }

    getRoles() {
        return [...this.roles];
    }

    getReminders() {
        return [...this.reminders];
    }

    setRoleCoords(index: number, coords: ICoordinates) {

        const role = this.roles[index];

        if (!role) {
            throw new ReferenceError(`Cannot find role with index ${index}`);
        }

        role.coords = coords;

    }

}
