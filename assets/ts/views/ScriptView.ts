import type {
    IMetaEntry,
    IScript,
} from "../types/data";
import View from "./View";
import {
    NoActiveFieldError,
} from "../errors/errors";
import {
    findOrDie,
    renderTemplateMany,
} from "../utilities/dom";
import Tabs from "../classes/UI/Tabs";
import InputProcessor from "../classes/InputProcessor/InputProcessor";
import File from "../classes/InputProcessor/File";
import URL from "../classes/InputProcessor/URL";
import Paste from "../classes/InputProcessor/Paste";

export default class ScriptView extends View<{
    "script-select": IScript,
    "script-id-select": string,
}> {

    protected selectForm: HTMLFormElement;
    protected customForm: HTMLFormElement;
    protected selection: HTMLElement;
    protected fields: Record<string, InputProcessor>;
    protected tabs: Tabs;

    discoverElements() {

        this.selectForm = findOrDie("#script-select-form");
        this.customForm = findOrDie("#script-custom-form");
        this.selection = findOrDie("#script-select-list");
        this.fields = {
            upload: new File(findOrDie("#script-custom-upload")),
            url: new URL(findOrDie("#script-custom-url")),
            paste: new Paste(findOrDie("#script-custom-paste")),
        };
        this.tabs = new Tabs(findOrDie("#script-tabs"));

        this.setFieldsActive(this.fields.upload.getInput());

    }

    addListeners() {

        const {
            selectForm,
            customForm,
            fields,
        } = this;

        selectForm.addEventListener("submit", (e) => {

            e.preventDefault();
            const input = selectForm.querySelector<HTMLInputElement>(":checked");
            const value = input?.value || "";

            if (value) {
                this.trigger("script-id-select", value);
            }

        });

        customForm.addEventListener("submit", (e) => {

            e.preventDefault();
            this.processCustom();

        });

        Object.values(fields).forEach((field) => {

            const input = field.getInput();

            input.addEventListener("input", () => {
                this.setFieldsActive(input);
            });

        });

    }

    setFieldsActive(input: HTMLElement) {

        Object.values(this.fields).forEach((field) => {

            const isActive = field.is(input);

            field.setActive(isActive);
            field.setRequired(isActive);
            field.setCustomValidity("");

        });

    }

    drawScripts(scripts: Record<string, IMetaEntry>) {

        this.selection.append(renderTemplateMany(
            "#script-select-template",
            Object.entries(scripts),
            ([id, meta], index) => ({
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
                },
            }),
        ));

    }

    processCustom() {

        const fields = Object.values(this.fields);
        fields.forEach((field) => field.setCustomValidity(""));
        const field = fields.find((field) => field.isActive());

        if (!field) {
            return;
        }

        field.process().then(
            (script) => this.trigger("script-select", script),
            (reason) => {
                field.setCustomValidity(reason);
                this.customForm.reportValidity();
            },
        );

    }

    showCustomError(error: string) {

        const {
            fields,
            customForm,
        } = this;
        const field = Object.values(fields).find((field) => field.isActive());

        if (!field) {
            throw new NoActiveFieldError(error);
        }

        field.setCustomValidity(error);
        customForm.reportValidity();

    }

}
