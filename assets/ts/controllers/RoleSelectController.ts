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

        model.on("script-set", (script) => view.drawRoles(script));
        model.on("player-count-update", (count) => {
            view.updateGroups(model.getNumbers(count));
        });
        view.on("random-select", () => {
            model.getRandomPlayers();
        });

        view.drawGroups(model.getTexts());
        view.updateGroups(model.getNumbers(model.getPlayerCount()));
        view.drawRoles(model.getScriptByTeam());

    }

}
