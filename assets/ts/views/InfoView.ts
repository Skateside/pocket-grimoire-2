import View from "./View";
import {
    IInfoData,
    IInfoToken,
    IQuerySelectorOptions,
} from "../types/types";
import {
    querySelectorCached,
    renderTemplate,
    updateChildren,
} from "../utilities/dom";
import {
    toHTML,
    strip,
} from "../utilities/markdown";

export default class InfoView extends View<{
}> {

    protected official: HTMLElement;

    discoverElements(): void {

        const options: IQuerySelectorOptions = {
            required: true
        }

        this.official = querySelectorCached("#info-token-official-holder", options)!;
        // this.homebrew = querySelectorCached("#info-token-custom-holder", options)!;
        // this.dialogs = querySelectorCached("#info-token-dialog-holder", options)!;
        // this.addButton = querySelectorCached("#add-info-token", options)!;

    }

    renderInfos(infos: Record<IInfoToken["type"], IInfoToken[]>) {

        const contents = infos.official.reduce((frag, { id, text, colour }) => {

            frag.append(
                renderTemplate("#info-token-template", {
                    ".js--info-token--wrapper"(element) {
                        element.dataset.id = id;
                    },
                    ".js--info-token--trigger"(element) {
                        element.dataset.id = id;
                        element.textContent = strip(text);
                        element.style.setProperty("--bg", `var(--${colour})`);
                    },
                })
            );

            return frag;

        }, document.createDocumentFragment());

        this.official.append(contents);

    }

}

/*
export default class InfoView extends View<{
    "info-edit": null,
    "info-remove": number,
}> {

    // protected official: HTMLElement;
    protected homebrew: HTMLElement;
    protected dialogs: HTMLElement;
    protected addButton: HTMLElement;

    static makeDialogId(info: IInfoData) {
        return `info-token--${info.index}`;
    }

    discoverElements() {

        const options: IQuerySelectorOptions = {
            required: true
        }

        // this.official = querySelectorCached("#info-token-button-holder", options);
        this.homebrew = querySelectorCached("#info-token-custom-holder", options)!;
        this.dialogs = querySelectorCached("#info-token-dialog-holder", options)!;
        this.addButton = querySelectorCached("#add-info-token", options)!;

    }

    removeHomebrewByIndex(index: number) {

        if (Number.isNaN(index)) {
            throw new TypeError("NaN given to removeHomebrewByIndex");
        }

        const {
            dialogs,
            homebrew,
        } = this;

        dialogs.querySelector(`#info-token--${index}`)?.remove();
        homebrew.querySelector(`[data-dialog="#info-token--${index}"]`)
            ?.closest(".js--info-token--wrapper")
            ?.remove();

    }

    drawHomebrew(infos: IInfoData[]) {
        infos.forEach((info) => this.drawHomebrewEntry(info));
    }

    drawHomebrewEntry(info: IInfoData) {

        const {
            index,
        } = info;

        // Maybe something is needed here to generate the index if it's not yet
        // set.
        if (typeof index === "number") {
            this.removeHomebrewByIndex(index);
        }

        const constructor = this.constructor as typeof InfoView;
        const dialogId = constructor.makeDialogId(info);

        this.dialogs.append(
            renderTemplate("#info-token-dialog-template", {
                ".js--info-token--dialog"(element) {

                    element.id = dialogId;
                    element.style.setProperty(
                        "--colour",
                        `var(--${info.colour})`,
                    );

                },
                ".js--info-token--actions"(element) {
                    element.querySelectorAll("button").forEach((button) => {
                        button.dataset.index = String(info.index);
                    });
                },
            })
        );

        this.homebrew.append(
            renderTemplate("#info-token-button-template", {
                ".js--info-token--wrapper"(element) { // <li>
                    element.dataset.index = String(info.index);
                },
                ".js--info-token--button"(element) {
                    element.dataset.dialog = `#${dialogId}`;
                },
            })
        );

        this.updateHomebrew(info);

    }

    updateHomebrew(info: IInfoData) {

        const constructor = this.constructor as typeof InfoView;
        const dialogId = constructor.makeDialogId(info);

        const dialog = this.dialogs.querySelector<HTMLElement>(`#${dialogId}`);
        const homebrew = this.homebrew.querySelector<HTMLElement>(
            `.js--info-token--wrapper[dataset-index="${info.index}"]`
        );

        if (!dialog || !homebrew) {
            return;
        }

        updateChildren(dialog, {
            ".js--info-token--dialog-text"(element) {
                element.innerHTML = toHTML(info.text);
            },
        });

        updateChildren(homebrew, {
            ".js--info-token--button"(element) {

                element.textContent = strip(info.text);
                element.style.setProperty(
                    "--bg-colour",
                    `var(--${info.colour})`
                );

            },
        });

    }

}
*/
