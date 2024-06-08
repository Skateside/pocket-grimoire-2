import {
    IObjectDiff,
} from "../types/utilities";
import {
    IInfoToken,
} from "../types/data";
import Model from "./Model";
import {
    diff,
    isEmpty,
    deepClone,
} from "../utilities/objects";
import {
    randomId,
} from "../utilities/strings";

export default class InfoModel extends Model<{
    "info-update": IObjectDiff<IInfoToken>,
}> {

    protected infos: IInfoToken[];

    ready() {
        super.ready();
        this.infos = this.store.getData("infos");
    }

    addStoreListeners() {

        const {
            store,
        } = this;

        store.on("infos-set", (infos) => this.updateInfos(infos));

    }

    static makeDiff(infos: IInfoToken[]) {
        return Object.fromEntries(infos.map((info) => [info.id, info]));
    }

    updateInfos(infos: IInfoToken[]) {

        const constructor = this.constructor as typeof InfoModel;
        const oldTexts = constructor.makeDiff(this.infos);
        const newTexts = constructor.makeDiff(infos);
        const difference = diff<IInfoToken>(oldTexts, newTexts);

        if (!isEmpty(difference)) {

            this.trigger("info-update", difference);
            this.infos.length = 0;
            this.infos.push(...infos);

        }

    }

    updateInfo(info: IInfoToken) {

        const infos = deepClone(this.infos);

        let index = infos.findIndex(({ id }) => id === info.id);

        if (index < 0) {
            index = infos.length;
        }

        if (info.text.trim()) {
            infos[index] = info;
        } else {
            infos.splice(index, 1);
        }

        this.store.setData("infos", infos);

    }

    updateCustomInfo(info: Partial<IInfoToken>) {

        const customInfo = {
            id: info.id || randomId("cit-"),
            text: info.text || "",
            colour: "grey",
            type: "custom",
        } as IInfoToken;

        this.updateInfo(customInfo);

    }

    getInfosByType() {
        return Object.groupBy(this.infos, ({ type }) => type);
    }

}
