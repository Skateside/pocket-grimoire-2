import View from "./View";
import {
    IMetaEntry,
} from "../types/types";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import Tabs from "../classes/Tabs";

export default class ScriptView extends View<{
    "script-select": string,
}> {

    protected scriptSelectForm: HTMLFormElement;
    protected scriptSelection: HTMLElement;
    protected scriptCustomForm: HTMLFormElement;
    protected tabs: Tabs;

    discoverElements(): void {

        this.scriptSelectForm = findOrDie("#script-select-form");
        this.scriptSelection = findOrDie("#script-select-list");
        this.scriptCustomForm = findOrDie("#script-custom-form");
        this.tabs = new Tabs(findOrDie("#script-tabs"));

    }

    addListeners(): void {

        const {
            scriptSelectForm,
            scriptCustomForm,
        } = this;

        scriptSelectForm.addEventListener("submit", (e) => {

            e.preventDefault();
            const input = scriptSelectForm.querySelector<HTMLInputElement>(":checked");
            const value = input?.value || "";

            if (value) {
                this.trigger("script-select", value);
            }

        });

        scriptCustomForm.addEventListener("submit", (e) => {
            e.preventDefault();
        });

    }

    drawScripts(scripts: Record<string, IMetaEntry>) {

        const contents = Object
            .entries(scripts)
            .reduce((frag, [id, meta], index) => {

                frag.append(
                    renderTemplate("#script-select-template", {
                        ".js--script-select--label"(element: HTMLLabelElement) {
                            element.htmlFor = `script-${id}`;
                        },
                        ".js--script-select--input"(element: HTMLInputElement) {
                            element.id = `script-${id}`;
                            element.value = id;
                            element.required = index === 0;
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
