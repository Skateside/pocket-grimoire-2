import RoleSelectViewModel from "../viewmodels/RoleSelectViewModel";
import RoleSelectView from "../views/RoleSelectView";
import Controller from "./Controller";

export default class RoleSelectController extends Controller<RoleSelectViewModel, RoleSelectView> {

    render(): void {

        super.render();

        const {
            model,
            view,
        } = this;
        const gameModel = model.getModel("game");
        const repoModel = model.getModel("repo");

        repoModel.on("script-update", () => {
            view.drawSelection(repoModel.getScriptRolesByTeam());
        });
        repoModel.on("bag-update", () => {
            view.drawBag(repoModel.getInBagRoles());
        });

        view.on("roles-selected", (bag) => {
            repoModel.setBag(bag);
        });
        view.on("player-count-update", (number) => {
            view.setGameNumbers(gameModel.getNumbers(number));
        });

        view.setGameNumbers(gameModel.getNumbers(view.getPlayerCount()));

    }

}
