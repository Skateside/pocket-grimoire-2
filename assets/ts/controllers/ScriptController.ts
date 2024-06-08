import Controller from "./Controller";
import ScriptModel from "../models/ScriptModel";
import ScriptView from "../views/ScriptView";

export default class ScriptController extends Controller<ScriptModel, ScriptView> {

    render(): void {

        super.render();

        const {
            model,
            view,
        } = this;

        // view.setInputStates(model.isOffline());
        view.drawScripts(model.getScripts());

        view.on("script-select", (script) => model.setScript(script));
        view.on("script-id-select", (id) => model.setScriptById(id));

        model.on("script-error", (error) => view.showCustomError(error));

    }

}
