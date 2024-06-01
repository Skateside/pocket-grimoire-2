import Controller from "./Controller";
import InfoModel from "../models/InfoModel";
import InfoView from "../views/InfoView";

export default class InfoController extends Controller<InfoModel, InfoView> {

    render(): void {

        super.render();

        const {
            model,
            view,
        } = this;

        view.renderInfos(model.getInfos());
        view.on("info-update", (info) => model.updateCustomInfo(info));
        model.on("info-update", (update) => view.updateInfos(update));

    }

}
