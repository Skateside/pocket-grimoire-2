import type {
    IGameNumbers,
    IScriptByTeam,
} from "../types/data";
import View from "./View";
import RangeCount from "../classes/UI/RangeCount";
import {
    findOrDie,
    renderTemplateMany,
} from "../utilities/dom";
import {
    supplant,
} from "../utilities/strings";

type ITeamElements = Record<string, Record<"group" | "items", HTMLElement>>;

const UNKNOWN_MAX = "X";

export default class RoleSelectView extends View<{
    "count-update": number,
}> {

    protected roleCounts: WeakMap<HTMLInputElement, RangeCount>;
    protected groups: HTMLElement;
    protected legends: Record<string, HTMLElement>;
    protected teams: ITeamElements;

    discoverElements() {

        this.roleCounts = new WeakMap();
        this.groups = findOrDie("#role-select-groups");
        this.legends = Object.create(null);
        this.teams = Object.create(null);

    }

    drawGroups(texts: [string, string][]) {

        const {
            legends,
            groups,
        } = this;

        groups.append(renderTemplateMany(
            "#role-select-group-template",
            texts,
            ([id, text]) => ({
                ".js--role-select-group--team"(element) {
                    element.dataset.id = id;
                },
                ".js--role-select-group--legend"(element) {
                    element.dataset.group = text;
                    element.dataset.count = "0";
                    element.dataset.max = UNKNOWN_MAX;
                    legends[id] = element;
                },
            }),
        ));

        this.teams = Array.prototype.reduce.call(
            groups.querySelectorAll(".js--role-select-group--team"),
            (teams: ITeamElements, element: HTMLElement) => {

                teams[element.dataset.id] = {
                    group: element,
                    items: findOrDie(".js--role-select-group--items", element),
                };

                return teams;

            },
            Object.create(null),
        ) as ITeamElements;

    }

    drawRoles(script: Partial<IScriptByTeam>) {

        const {
            teams,
            roleCounts,
        } = this;

        Object.values(teams).forEach(({ group, items }) => {

            group.hidden = true;
            items.innerHTML = "";

        });

        Object.entries(script).forEach(([team, roles]) => {

            const {
                group,
                items,
            } = teams[team] || {};

            if (!group || !items) {
                return;
            }

            items.append(renderTemplateMany(
                "#role-select-item-template",
                roles,
                (role) => ({
                    ".js--role-select-item--checkbox"(element: HTMLInputElement) {
                        element.id = `role-select-${role.id}`;
                        element.value = role.id;
                    },
                    // TEMP: this is only commented out to prevent 404's in the console.
                    // ".js--role-select--image"(element: HTMLImageElement) {
                    //     element.src = role.image;
                    // },
                    ".js--role-select-item--name"(element) {
                        element.textContent = role.name;
                    },
                    ".js--role-select-item--ability"(element) {
                        element.textContent = role.ability;
                    },
                    ".js--role-select-item--quantity"(element: HTMLLabelElement) {

                        element.htmlFor = `quantity-${role.id}`;
                        element.textContent = supplant(
                            element.dataset.text,
                            [role.name]
                        );

                    },
                    ".js--role-select-item--input"(element: HTMLInputElement) {

                        element.id = `quantity-${role.id}`;
                        element.name = `quantity[${role.id}]`;
                        roleCounts.set(
                            element,
                            new RangeCount(
                                element,
                                element
                                    .parentElement
                                    .querySelector<HTMLOutputElement>(
                                        ".js--role-select-item--output"
                                    ),
                            ),
                        );

                    },
                    ".js--role-select-item--label"(element: HTMLLabelElement) {
                        element.htmlFor = `role-select-${role.id}`;
                    },
                }),
            ));
            group.hidden = false;

        });

    }

    updateGroups(numbers: IGameNumbers) {

        Object.entries(numbers).forEach(([id, count]) => {
            this.updateGroup(id, String(count));
        });

        this.updateGroup("traveler", UNKNOWN_MAX);

    }

    updateGroup(id: string, count: string) {

        const {
            groups,
            legends,
        } = this;
        const legend = legends[id];

        if (!legend) {
            return;
        }

        legend.dataset.max = count;

        legend.textContent = supplant(groups.dataset.text, [
            legend.dataset.group,
            legend.dataset.count,
            legend.dataset.max,
        ]);


    }

}
