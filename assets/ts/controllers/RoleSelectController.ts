import RepositoryModel from "../models/RepositoryModel";
import RoleSelectView from "../views/RoleSelectView";
import Controller from "./Controller";

export default class RoleSelectController extends Controller<RepositoryModel, RoleSelectView> {

    render(): void {

        super.render();

        const {
            model,
            view
        } = this;

        model.on("script-update", () => {
            view.drawSelection(model.getScriptRolesByTeam());
        });
        model.on("bag-update", () => {
            view.drawBag(model.getInBagRoles());
        });

        view.on("roles-selected", (bag) => {
            model.setBag(bag);
        });

    }

}
