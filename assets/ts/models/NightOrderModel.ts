import Model from "./Model";
import {
    IScript,
    INights,
    IMetaEntry,
    INightOrderDatum,
} from "../types/data";

export default class NightOrderModel extends Model<{
    "script-set": Record<INights, INightOrderDatum[]>,
}> {

    protected data: Record<INights, INightOrderDatum[]>;

    ready() {

        super.ready();

        this.data = {
            firstNight: Object.create(null),
            otherNight: Object.create(null),
        };

    }

    addStoreListeners() {

        const {
            store,
        } = this;

        store.on("script-set", (script) => this.processNightOrder(script));
        // TODO: listen for player dead toggle
        // TODO: listen for role added

    }

    processNightOrder(script: IScript) {

        const meta = script.find((entry) => {
            return typeof entry === "object" && entry.id === "_meta";
        }) as IMetaEntry;

        if (!meta) {
            return;
        }

        const {
            data,
        } = this;

        data.firstNight = meta.firstNight.map((id) => this.makeData(id));
        data.otherNight = meta.otherNight.map((id) => this.makeData(id));

        this.trigger("script-set", data);

    }

    makeData(roleId: string): INightOrderDatum {

        return {
            role: this.store.getRole(roleId),
            dead: 0,
            added: 0,
        };

    }

}
