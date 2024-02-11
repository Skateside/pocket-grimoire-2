import View from "./View";
import {
    ITeam,
    IRole,
} from "../types/types";
import {
    renderTemplate,
} from "../utilities/dom";

export default class RoleSelectView extends View {

    private fieldsets: Record<ITeam, HTMLElement>;

    discoverElements(): void {

        this.fieldsets = Array.prototype.reduce.call(
            document.querySelectorAll(".js--role-select--team"),
            (group: Record<ITeam, HTMLElement>, element: HTMLElement) => {

                group[element.dataset.team as ITeam] = (
                    element.querySelector(".js--role-select--items")
                );
                return group;

            },
            Object.create(null)
        );

    }

    drawSelection(teams: Record<ITeam, IRole[]>) {

        Object.entries(teams).forEach(([team, roles]) => {

            const fieldset = this.fieldsets[team as ITeam];
            fieldset.replaceChildren(
                ...roles.map((role) => renderTemplate("#role-select", {
                    ".js--role-select--checkbox"(element: HTMLInputElement) {
                        element.value = role.id;
                    },
                    ".js--role-select--image"(element: HTMLImageElement) {
                        element.src = role.image;
                    },
                    ".js--role-select--name"(element) {
                        element.textContent = role.name;
                    },
                    ".js--role-select--ability"(element) {
                        element.textContent = role.ability;
                    }
                }))
            );

        });

    }

}
