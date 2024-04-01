import Controller from "./Controller";
import TokenModel from "../models/TokenModel";
import TokenView from "../views/TokenView";
import {
    IRole,
} from "../types/types";

export default class TokenController extends Controller<TokenModel, TokenView> {

    protected roles: Record<string, IRole> = Object.create(null);

    setRoles(roles: Record<string, IRole>) {
        this.roles = roles;
    }

    render(): void {

        const {
            model,
            view
        } = this;

        model.getRoles().forEach(({ role, coords }, index) => {
            view.drawRole(role, coords, index);
        });

        model.getReminders().forEach(({ role, coords }, index) => {
            view.drawReminder(role, coords, index);
        });

    }

}
