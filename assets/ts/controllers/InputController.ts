import Controller from "./Controller";
import InputModel from "../models/InputModel";
import InputView from "../views/InputView";

export default class InputController extends Controller<InputModel, InputView> {

    render() {

        const {
            model,
            view,
        } = this;

        view.on("input-update", (data) => model.update(data));
        view.on("inputs-removed", () => view.confirmData(model.getValues()));

        view.populate(model.getValues());
        view.watchInputs();

    }

}
