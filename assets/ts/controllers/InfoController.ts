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

        view.drawHomebrew(model.getInfos().homebrew);

        view.on("info-edit", () => {
            // Trigger something that allows us to edit the info text.
        });
        view.on("info-remove", (index) => {
            model.deleteInfo(index);
        });

        model.on("infos-update", () => {
            view.drawHomebrew(model.getInfos().homebrew);
        });
        model.on("info-update", (info) => {
            view.updateHomebrew(info);
        });
        model.on("info-remove", (index) => {
            view.removeHomebrewByIndex(index);
        });

    }

}
