import Controller from "./Controller";
import RepositoryModel from "../models/RepositoryModel";
import NightOrderView from "../views/NightOrderView";

export default class NightOrderController extends Controller<RepositoryModel, NightOrderView> {

    render() {

        super.render();

        const {
            model,
            view,
        } = this;

        view.drawNights(model.getScriptNightsRoles());
        view.markInPlay(model.getInPlayRoles());

        model.on("script-update", () => {
            view.drawNights(model.getScriptNightsRoles());
            view.markInPlay(model.getInPlayRoles());
        });
        model.on("inplay-update", () => {
            view.markInPlay(model.getInPlayRoles());
        });

    }

}
