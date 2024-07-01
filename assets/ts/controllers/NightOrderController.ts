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

        model.on("script-set", (nights) => view.drawNights(nights));
        model.on("update-states", (diff) => view.updateElements(diff));

        view.on("filters-update", (filters) => model.setFilters(filters));

        model.loadScript();
        model.setFilters(view.getFilters());

    }

}
