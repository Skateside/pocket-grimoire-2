import View from "./View";
import {
    INumeric,
    IDomLookupCache,
} from "../types/utilities";
import {
    ICoreTeam,
    IPlayTeam,
    IRole,
    IGameNumbers,
} from "../types/data";
import {
    renderTemplate,
    serialiseForm,
    announceInput,
    identify,
    makeLookupCache,
} from "../utilities/dom";
import {
    supplant,
} from "../utilities/strings";

type IFieldsetData = {
    content: HTMLElement,
    legend: HTMLElement,
    inputs: HTMLInputElement[],
};

export default class RoleSelectView extends View<{
    "roles-selected": Record<string, INumeric>,
    "player-count-update": number,
    // "role-count-update": [string, number],
}> {

    protected form: HTMLElement;
    protected fieldsets: Record<IPlayTeam, IFieldsetData>;
    protected roleCount: HTMLInputElement;
    protected roleDraw: HTMLElement;
    protected getRangeFromCheckbox: IDomLookupCache<HTMLInputElement>;
    protected getCheckboxFromRange: IDomLookupCache<HTMLInputElement>;

    constructor() {

        super();

        this.getRangeFromCheckbox = makeLookupCache((element) => {

            return element
                .closest(".js--role-select--role")
                .querySelector<HTMLInputElement>(".js--role-select--input")

        });

        this.getCheckboxFromRange = makeLookupCache((element) => {

            return element
                .closest(".js--role-select--role")
                .querySelector<HTMLInputElement>(".js--role-select--checkbox")

        });

    }

    discoverElements() {

        this.form = document.querySelector(".js--role-select--roles");

        this.fieldsets = Array.prototype.reduce.call(
            document.querySelectorAll(".js--role-select--team"),
            (
                group: Record<IPlayTeam, IFieldsetData>,
                element: HTMLElement,
            ) => {

                group[element.dataset.team as IPlayTeam] = {
                    legend: element.querySelector(".js--role-select--legend"),
                    content: element.querySelector(".js--role-select--items"),
                    inputs: [],
                };
                return group;

            },
            Object.create(null)
        );

        this.roleCount = document.querySelector(".js--role-select--count");
        this.updatePlayerCount(Number(this.roleCount.value));

        this.roleDraw = document.querySelector(".js--role-draw");

    }

    drawSelection(teams: Record<IPlayTeam, IRole[]>) {

        Object.entries(teams).forEach(([team, roles]) => {

            const fieldset = this.fieldsets[team as IPlayTeam];
            fieldset.content.replaceChildren(
                ...roles.map((role) => renderTemplate("#role-select", {
                    ".js--role-select--checkbox"(element: HTMLInputElement) {
                        element.value = role.id;
                    },
                    // TEMP: this is only commented out to prevent 404's in the console.
                    // ".js--role-select--image"(element: HTMLImageElement) {
                    //     element.src = role.image;
                    // },
                    ".js--role-select--name"(element) {
                        element.textContent = role.name;
                    },
                    ".js--role-select--ability"(element) {
                        element.textContent = role.ability;
                    },
                    ".js--role-select--quantity"(element) {

                        element.textContent = supplant(
                            element.dataset.text,
                            [role.name]
                        );

                    },
                    ".js--role-select--input"(element: HTMLInputElement) {

                        element.name = `quantity[${role.id}]`;
                        // element.dataset.id = role.id;
                        element.dataset.output = "#" + identify(
                            element
                                .parentElement
                                .querySelector(".js--role-select--output")
                        )

                    }
                }))
            );

            fieldset.inputs = [
                ...fieldset
                    .content
                    .querySelectorAll<HTMLInputElement>(".js--role-select--input")
            ];

        });

    }

    drawBag(bag: IRole[]) {

        this.roleDraw.replaceChildren(
            ...bag.map((role, index) => renderTemplate("#role-draw", {
                ".js--role-draw--button"(element) {
                    element.textContent = String(index + 1);
                    element.textContent += ` (${role.name})`; // TEMP
                    // TODO: make some hidden data to associate the button with
                    // the role - the current PG uses a data-* attribute,
                    // exposing the information.
                }
            }))
        );

    }

    addListeners() {

        const {
            form,
            roleCount,
        } = this;

        form.addEventListener("input", ({ target }) => {

            const input = target as HTMLInputElement;

            if (input.matches(".js--role-select--input")) {

                // this.trigger("role-count-update", [
                //     input.dataset.id,
                //     Number(input.value),
                // ]);
                this.updateCheckbox(input);
                return this.updateLegendCounts();

            }

            if (input.matches(".js--role-select--checkbox")) {
                return this.updateRange(input);
            }

        });

        form.addEventListener("submit", (e) => {

            e.preventDefault();
            const { quantity } = serialiseForm(form as HTMLFormElement);
            this.trigger("roles-selected", quantity);

        });

        roleCount.addEventListener("input", () => {
            this.updatePlayerCount(Number(roleCount.value));
        });

    }

    updateRange(input: HTMLInputElement) {

        const range = this.getRangeFromCheckbox(input);
        range.value = String(Number(input.checked));
        announceInput(range);

    }

    updatePlayerCount(playerCount: number) {
        this.trigger("player-count-update", playerCount);
    }

    setGameNumbers(gameNumbers: IGameNumbers) {

        Object.entries(this.fieldsets).forEach(([team, { legend }]) => {

            const playTeam = team as IPlayTeam;

            if (Object.hasOwn(gameNumbers, playTeam)) {
                legend.dataset.max = String(gameNumbers[playTeam as ICoreTeam]);
            }

            this.updateLegend(legend);

        });

    }

    updateLegend(legend: HTMLElement) {
        legend.textContent = supplant(legend.dataset.text, legend.dataset);
    }

    updateLegendCounts() {

        Object.values(this.fieldsets).forEach(({ inputs, legend }) => {

            legend.dataset.count = String(
                inputs.reduce(
                    (total, input) => total + Number(input.value),
                    0,
                )
            )
            this.updateLegend(legend);

        });

    }

    getPlayerCount() {
        return Number(this.roleCount.value);
    }

    updateCheckbox(input: HTMLInputElement) {
        this.getCheckboxFromRange(input).checked = Number(input.value) > 0;
    }

}
