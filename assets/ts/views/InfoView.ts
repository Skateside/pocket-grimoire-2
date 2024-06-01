import View from "./View";
import {
    IInfoToken,
    IObjectDiff,
} from "../types/types";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import {
    toHTML,
    strip,
} from "../utilities/markdown";

export default class InfoView extends View<{
    "info-update": {
        id: string,
        text: string,
    },
}> {

    protected wrapper: HTMLElement;
    protected dialog: HTMLDialogElement;
    protected dialogText: HTMLElement;
    protected addButton: HTMLButtonElement;
    protected form: HTMLFormElement;
    protected idInput: HTMLInputElement;
    protected textInput: HTMLInputElement;

    discoverElements(): void {

        this.wrapper = findOrDie("#info-token-wrapper");
        this.dialog = findOrDie("#info-token-dialog");
        this.dialogText = findOrDie("#info-token-dialog-text");
        this.addButton = findOrDie("#info-token-add");
        this.form = findOrDie("#info-token-form");
        this.idInput = findOrDie("#info-token-custom-id");
        this.textInput = findOrDie("#info-token-custom-text");

    }

    addListeners(): void {

        const {
            wrapper,
            dialog,
            dialogText,
            addButton,
            form,
            idInput,
            textInput,
        } = this;

        wrapper.addEventListener("click", ({ target }) => {

            const htmlTarget = target as HTMLElement;

            if (htmlTarget.classList.contains("js--info-token--trigger")) {

                const {
                    id,
                    text,
                    type,
                    colour,
                } = htmlTarget.dataset as IInfoToken;

                dialog.style.setProperty("--colour", `var(--${colour})`);
                dialog.classList.toggle("is-custom", type === "custom");
                dialog.dataset.id = id;
                dialog.dataset.text = text;
                dialogText.innerHTML = toHTML(text);

            }

        });

        addButton.addEventListener("click", () => {

            idInput.value = "";
            textInput.value = "";
            form.hidden = false;

        });

        form.addEventListener("submit", (e) => {

            e.preventDefault();
            this.trigger("info-update", {
                id: idInput.value,
                text: textInput.value,
            });
            form.reset();

        });

        form.addEventListener("reset", () => {

            idInput.value = "";
            form.hidden = true;

        });

        dialog.addEventListener("click", ({ target }) => {

            const htmlTarget = (target as HTMLElement)
                .closest<HTMLButtonElement>("[data-action]");

            if (!htmlTarget) {
                return;
            }

            switch (htmlTarget.dataset.action) {

            case "edit":
                idInput.value = dialog.dataset.id;
                textInput.value = dialog.dataset.text;
                form.hidden = false;
                dialog.close();
                break;

            case "delete":
                this.trigger("info-update", {
                    id: dialog.dataset.id,
                    text: "",
                });
                form.reset();
                dialog.close();
                break;

            }

        });

    }

    static renderInfoTrigger(info: IInfoToken) {

        return renderTemplate("#info-token-template", {
            ".js--info-token--wrapper"(element) {
                element.dataset.id = info.id;
            },
            ".js--info-token--trigger"(element) {
                Object.assign(element.dataset, info);
                element.textContent = strip(info.text);
                element.style.setProperty("--bg", `var(--${info.colour})`);
            },
        });

    }

    renderInfos(infos: Partial<Record<IInfoToken["type"], IInfoToken[]>>) {

        const constructor = this.constructor as typeof InfoView;

        Object.entries(infos).forEach(([type, infos]) => {

            findOrDie(`[data-type="${type}"]`, this.wrapper).append(
                infos.reduce((frag, info) => {

                    frag.append(constructor.renderInfoTrigger(info));
                    return frag;

                }, document.createDocumentFragment())
            );

        });

    }

    updateInfos(update: IObjectDiff<IInfoToken>) {

        const constructor = this.constructor as typeof InfoView;
        const custom = this.wrapper.querySelector("[data-type=\"custom\"]");

        Object.entries(update).forEach(([id, diff]) => {

            const existing = (
                (diff.type === "update" || diff.type === "remove")
                ? custom.querySelector(
                    `.js--info-token--wrapper[data-id="${id}"]`
                )
                : null
            );
            const render = (
                (diff.type === "new" || diff.type === "update")
                ? constructor.renderInfoTrigger(diff.value)
                : null
            );

            if (diff.type === "new" || (diff.type === "update" && !existing)) {
                return custom.append(render);
            }

            if (diff.type === "update") {
                return existing.replaceWith(render);
            }

            if (diff.type === "remove" && existing) {
                existing.remove();
            }

        });

    }

}
