import Controller from "./Controller";
import RepositoryModel from "../models/RepositoryModel";
import EditionView from "../views/EditionView";

export default class EditionController extends Controller<RepositoryModel, EditionView> {

    render(): void {

        super.render();

        const {
            model,
            view
        } = this;

        view.on("edition-selected", (edition) => {
            model.setScriptByEdition(edition);
        });

    }

}
