import {
    // IInfoData,
    IColours,
    IObjectDiff,
    IInfoToken,
} from "../types/types";
import Model from "./Model";
import {
    diff,
    isEmpty,
} from "../utilities/objects";

export default class InfoModel extends Model<{
    "info-update": IObjectDiff,
}> {

    protected infos: IInfoToken[];

    setup(): void {
        this.infos = this.store.getData("infos");
    }

    addStoreListeners(): void {
        
        const {
            store,
        } = this;

        store.on("infos-set", (infos) => this.updateInfos(infos));

    }

    static makeDiff(infos: IInfoToken[]) {
        return Object.fromEntries(infos.map(({ id, text }) => [id, text]));
    }

    updateInfos(infos: IInfoToken[]) {

        const constructor = this.constructor as typeof InfoModel;
        const oldTexts = constructor.makeDiff(this.infos);
        const newTexts = constructor.makeDiff(infos);
        const difference = diff(oldTexts, newTexts);

        if (!isEmpty(difference)) {

            this.trigger("info-update", difference);
            this.infos.length = 0;
            this.infos.push(...infos);

        }

    }

    getInfos() {
        return Object.groupBy(this.infos, ({ type }) => type);
    }

}

/*
export default class InfoModel extends Model<{
    "infos-update": null,
    "info-update": IInfoData,
    "info-remove": number,
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
            type: "official",
        });

    }

    addHomebrewInfo(text: string) {

        this.infos.push({
            text,
            colour: "grey",
            type: "homebrew",
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
                homebrew: [],
            }

        }

        return Object.groupBy(
            infos.map((info, index) => ({ ...info, index })),
            ({ type }) => type,
        );

    }

    resetInfos() {

        const {
            infos,
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
*/
