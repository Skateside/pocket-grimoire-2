import View from "./View";
import {
    IMetaEntry,
} from "../types/types";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";

export default class ScriptView extends View {

    protected scriptSelectForm: HTMLFormElement;
    protected scriptSelection: HTMLElement;
    protected scriptUploadForm: HTMLFormElement;

    discoverElements(): void {

        this.scriptSelectForm = findOrDie("#script-select-form");
        this.scriptSelection = findOrDie("#script-select-list");
        this.scriptUploadForm = findOrDie("#script-custom-form");

    }

    addListeners(): void {

        this.scriptSelectForm.addEventListener("submit", (e) => {
            e.preventDefault();
        });

        this.scriptUploadForm.addEventListener("submit", (e) => {
            e.preventDefault();
        });

    }

    drawScripts(scripts: Record<string, IMetaEntry>) {

        const contents = Object.entries(scripts).reduce((frag, [id, meta]) => {

            frag.append(
                renderTemplate("#script-select-template", {
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
