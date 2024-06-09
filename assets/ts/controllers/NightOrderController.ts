import Controller from "./Controller";
import NightOrderModel from "../models/NightOrderModel";
import NightOrderView from "../views/NightOrderView";

export default class NightOrderController extends Controller<NightOrderModel, NightOrderView> {

    render() {

        super.render();

        const {
            model,
            view,
        } = this;

        // model.on("script-set", (nights) => view.drawNights(nights));
        model.on("update", (update) => view.updateNights(update));

        // view.drawNights(model.getScriptNightsRoles());
        // view.markInPlay(model.getInPlayRoles());

        // model.on("script-update", () => {
        //     view.drawNights(model.getScriptNightsRoles());
        //     view.markInPlay(model.getInPlayRoles());
        // });
        // model.on("inplay-update", () => {
        //     view.markInPlay(model.getInPlayRoles());
        // });

    }

}
