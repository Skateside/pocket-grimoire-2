import View from "./View";
import {
    IMetaEntry,
} from "../types/types";
import {
    renderTemplate,
} from "../utilities/dom";

export default class ScriptView extends View {

    protected scriptSelection: HTMLElement;

    discoverElements(): void {

        this.scriptSelection = document.querySelector("#script-selection");

    }

    drawScripts(scripts: Record<string, IMetaEntry>) {

        const contents = Object.entries(scripts).reduce((frag, [id, meta]) => {

            frag.append(
                renderTemplate("#script-select", {
                    ".js--script-select--label"(element: HTMLLabelElement) {
                        element.htmlFor = `script-${id}`;
                    },
                    ".js--script-select--input"(element: HTMLInputElement) {
                        element.id = `script-${id}`;
                        element.value = id;
                    },
                    ".js--script-select--name"(element) {
                        element.textContent = meta.name;
                    }
                })
            );

            return frag;

        }, document.createDocumentFragment());

        this.scriptSelection.append(contents);

    }

}
