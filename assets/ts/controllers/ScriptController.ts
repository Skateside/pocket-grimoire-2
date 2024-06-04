import Controller from "./Controller";
import ScriptModel from "../models/ScriptModel";
import ScriptView from "../views/ScriptView";
// import {
//     IRole,
// } from "../types/types";

export default class ScriptController extends Controller<ScriptModel, ScriptView> {

    render(): void {

        super.render();

        const {
            model,
            view,
        } = this;

        view.drawScripts(model.getScripts());

        view.on("script-select", (scriptId) => model.setScriptById(scriptId));

    }

}
