import {
    wordlist,
} from "../utilities/strings";

export default class Dialog {

    static getDialog(selector: string) {

        const dialog = document.querySelector<HTMLDialogElement>(selector);

        if (!dialog) {
            console.warn(`Unable to find the dialog that matches "${selector}"`);
            return null;
        }

        if (!dialog.matches("dialog")) {
            console.warn(`Element that matches "${selector}" is not a <dialog>`);
            return null;
        }

        return dialog;

    }

    static showByTrigger(trigger: HTMLElement) {

        const dialog = this.getDialog(trigger.dataset.dialog);

        if (dialog) {
            this.create(dialog).show();
        }

    }

    static hideByTrigger(trigger: HTMLElement) {

        const selector = trigger.dataset.dialogHide;
        const dialog = (
            selector
            ? this.getDialog(selector)
            : trigger.closest("dialog")
        );

        if (dialog) {
            this.create(dialog).hide();
        }

    }

    static hasAddedListeners = false;

    static addListeners() {

        if (this.hasAddedListeners) {
            return;
        }

        this.hasAddedListeners = true;

        document.addEventListener("click", (e) => {

            const htmlTarget = e.target as HTMLElement;

            const trigger = htmlTarget.closest<HTMLElement>("[data-dialog]");

            if (trigger) {
                e.preventDefault();
                this.showByTrigger(trigger);
            }

            const hide = htmlTarget.closest<HTMLElement>("[data-dialog-hide]");

            if (hide) {
                e.preventDefault();
                this.hideByTrigger(hide);
            }

        });

    }

    static created = new WeakMap<HTMLDialogElement, Dialog>();

    static create(dialog: HTMLDialogElement) {

        const {
            created,
        } = this;
        let instance = created.get(dialog);

        if (!instance) {

            instance = new this(dialog);
            created.set(dialog, instance);

        }

        return instance;

    }

    protected dialog: HTMLDialogElement;

    constructor(dialog: HTMLDialogElement) {

        this.dialog = dialog;
        this.run();

    }

    run() {
        (this.constructor as typeof Dialog).addListeners();
        this.addListeners();
    }

    addListeners() {

        const {
            dialog,
        } = this;
        const hideOn = wordlist(dialog.dataset.hideOn || "") as ("click" | "backdrop")[];

        if (hideOn.includes("click")) {
            dialog.addEventListener("click", () => this.hide());
        }

        if (hideOn.includes("backdrop")) {

            dialog.addEventListener("click", ({ target }) => {

                if (!dialog.firstElementChild.contains(target as Element)) {
                    this.hide();
                }

            });

        }

    }

    process(type: "show" | "hide") {

        const {
            dialog,
        } = this;
        const preEvent = new CustomEvent(`dialog-before-${type}`, {
            bubbles: true,
            cancelable: true,
        });

        dialog.dispatchEvent(preEvent);

        if (preEvent.defaultPrevented) {
            return;
        }

        dialog[
            type === "show"
            ? "showModal"
            : "close"
        ]();

        dialog.dispatchEvent(new CustomEvent(`dialog-${type}`, {
            bubbles: true,
            cancelable: false,
        }));

    }

    show() {
        this.process("show");
    }

    hide() {
        this.process("hide");
    }

}
