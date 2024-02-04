import {
    IInfoData,
    IColours
} from "../types/types";
import Model from "./Model";

export default class InfoModel extends Model<{
    "infos-update": null,
    "info-update": IInfoData,
    "info-remove": number
}> {

    protected infos: IInfoData[] = [];

    constructor() {

        super();
        this.infos = [];

    }

    addOfficialInfo(text: string, colour: IColours = "blue") {

        this.infos.push({
            text,
            colour,
            type: "official"
        });

    }

    addHomebrewInfo(text: string) {

        this.infos.push({
            text,
            colour: "grey",
            type: "homebrew"
        });

    }

    updateInfo(index: number, text: string) {

        const {
            infos
        } = this;
        const info = infos[index];

        if (!info) {
            throw new ReferenceError(`Cannot find info token with index "${index}"`);
        }

        if (info.type === "homebrew") {
            throw new Error("Cannot update an official info token");
        }

        info.text = text;

    }

    getInfos() {

        const {
            infos
        } = this;

        // NOTE: this is probably only needed during development.
        if (!infos.length) {

            return {
                official: [],
                homebrew: []
            }

        }

        return Object.groupBy(
            infos.map((info, index) => ({ ...info, index })),
            ({ type }) => type
        );

    }

    resetInfos() {

        const {
            infos
        } = this;
        let index = infos.length;

        while (index) {

            index -= 1;

            // Remove anything that's homebrew or that's been deleted.
            if (!infos[index] || infos[index].type === "homebrew") {
                infos.splice(index, 1);
            }

        }

    }

    deleteInfo(index: number) {
        delete this.infos[index];
        // this will preserve the existing indicies so we don't have to re-draw
        // all the buttons/dialogs.
    }

}
