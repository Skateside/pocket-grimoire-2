import Model from "./Model";
import {
    IScript,
    INights,
    // IRole,
    IMetaEntry,
    INightOrderData,
    INightOrderDatum,
} from "../types/data";
import {
    IObjectDiff,
} from "../types/utilities";
import {
    deepClone,
    diff,
} from "../utilities/objects";

export default class NightOrderModel extends Model<{
    // "script-set": Record<INights, IRole[]>,
    "update": Record<INights, IObjectDiff<INightOrderData>>,
}> {

    protected data: Record<INights, INightOrderData>;

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

    }

    processNightOrder(script: IScript) {

        const {
            store,
            data,
        } = this;

        // data.firstNight.length = 0;
        // data.otherNight.length = 0;

        const meta = script.find((entry) => {
            return typeof entry === "object" && entry.id === "_meta";
        }) as IMetaEntry;

        if (!meta) {
            return;
        }

        const {
            firstNight: first,
            otherNight: other,
        } = meta;

        // const firstNight = first.map((id) => store.getRole(id));
        // const otherNight = other.map((id) => store.getRole(id));

        // data.firstNight.length = 0;
        // data.firstNight.push(
        //     ...first.map((id) => ({
        //         role: store.getRole(id),
        //         dead: false,
        //         added: false,
        //     }))
        // );

        // this.trigger("script-set", {
        //     firstNight,
        //     otherNight,
        // });

        const oldData = deepClone(data);
        // data.firstNight = first.map((id) => this.makeData(id));
        // data.otherNight = other.map((id) => this.makeData(id));

        data.firstNight = Object.fromEntries(
            first.map((id, index) => [id, this.makeData(id, index)])
        );
        data.otherNight = Object.fromEntries(
            other.map((id, index) => [id, this.makeData(id, index)])
        );

// NOTE: Have I confused `data` and `datum` here?
        const difference = Object.fromEntries(
            Object.entries(oldData).map(([night, info]: [INights, INightOrderData]) => [
                night,
                diff<INightOrderData>(info, data[night]),
            ])
        ) as Record<INights, IObjectDiff<INightOrderData>>;
        console.log({ difference });
        this.trigger("update", difference);

        // const constructor = this.constructor as typeof NightOrderModel;
        // constructor.setNight(data.firstNight, first.map((id) => store.getRole(id)));
        // constructor.setNight(data.otherNight, other.map((id) => store.getRole(id)));




    }

    makeData(roleId: string, index: number): INightOrderDatum {

        return {
            role: this.store.getRole(roleId),
            order: index,
            dead: false,
            added: false,
        };

    }

    // static setNight(night: INightOrderData[], roles: IRole[]) {

    //     night.length = 0;
    //     night.push(
    //         ...roles.map((role) => ({
    //             role,
    //             dead: false,
    //             added: false,
    //         }))
    //     );

    // }

}
