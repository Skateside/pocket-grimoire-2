import RoleSelectModel from "../models/RoleSelectModel";
import RoleSelectView from "../views/RoleSelectView";
import Controller from "./Controller";

export default class RoleSelectController extends Controller<RoleSelectModel, RoleSelectView> {

    render(): void {

        super.render();

        const {
            model,
            view,
        } = this;

        view.drawGroups(model.getTexts());
        view.updateGroups(model.getNumbers(view.getCount()));
        view.on("count-update", (number) => {
            view.updateGroups(model.getNumbers(number));
        });

        /*
        const {
            getGameNumbers,
        } = RepositoryModel;

        model.on("script-update", () => {
            view.drawSelection(model.getScriptRolesByTeam());
        });
        model.on("bag-update", () => {
            view.drawBag(model.getInBagRoles());
        });

        view.on("roles-selected", (bag) => {
            model.setBag(bag);
        });
        view.on("player-count-update", (number) => {
            view.setGameNumbers(getGameNumbers(number));
        });

        view.setGameNumbers(getGameNumbers(view.getPlayerCount()));
        */

    }

}
