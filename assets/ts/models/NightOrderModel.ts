import Model from "./Model";
import {
    IScript,
    INights,
    IMetaEntry,
    IRole,
    INightOrderDatum,
    INightOrderFilters,
} from "../types/data";
import {
    IObjectDiff,
} from "../types/utilities";
import {
    replace,
    unique,
} from "../utilities/arrays";
import {
    diff,
    empty,
    isEmpty,
} from "../utilities/objects";


export default class NightOrderModel extends Model<{
    "script-set": Record<INights, IRole[]>,
    "update-states": IObjectDiff<INightOrderDatum>,
}> {

    // protected data: Record<INights, INightOrderDatum[]>;
    protected nights: Record<INights, IRole[]>;
    protected filters: INightOrderFilters;
    // NOTE: maybe `added` and `dead` should be properties of the same object.
    protected added: Record<string, number>;
    protected dead: Record<string, number>;
    protected data: Record<string, INightOrderDatum>;

    ready() {

        super.ready();

        this.nights = {
            firstNight: [],
            otherNight: [],
        };

        this.filters = {
            showNotAdded: false,
            showDead: false,
        };

        this.added = Object.create(null);
        this.dead = Object.create(null);
        this.data = Object.create(null);

    }

    addStoreListeners() {

        const {
            store,
        } = this;

        store.on("script-set", (script) => this.processNightOrder(script));
        // TODO: listen for player dead toggle
        // TODO: listen for role added

    }

    setFilters(filters: Partial<INightOrderFilters>) {

        Object.assign(this.filters, filters);
        this.updateData(this.createData());

    }

    processNightOrder(script: IScript) {

        const meta = script.find((entry) => {
            return typeof entry === "object" && entry.id === "_meta";
        }) as IMetaEntry;

        if (!meta) {
            return;
        }

        const {
            store,
            nights,
        } = this;

        replace(
            nights.firstNight,
            meta.firstNight.map((id) => store.getRole(id)),
        );
        replace(
            nights.otherNight,
            meta.otherNight.map((id) => store.getRole(id)),
        );

        this.trigger("script-set", nights);
        this.updateData(this.createData());

    }

    createData(): Record<string, INightOrderDatum> {

        const {
            nights,
        } = this;
        const ids = unique([
            ...nights.firstNight.map(({ id }) => id),
            ...nights.otherNight.map(({ id }) => id),
        ]);

        return Object.fromEntries(ids.map((id) => [id, this.makeDatum(id)]));

    }

    updateData(newData: Record<string, INightOrderDatum>) {

        const {
            data,
            store,
        } = this;
        const difference = diff<INightOrderDatum>(data, newData);

        if (isEmpty(difference)) {
            return;
        }

        // Add the mechanical IDs to the difference so that the View gets them.
        store.getMechanicalRoleIds().forEach((id) => {

            if (Object.hasOwn(newData, id) && !Object.hasOwn(difference, id)) {
                difference[id] = { type: "update", value: newData[id] };
            }

        });

        Object.assign(empty(data), newData);
        this.trigger("update-states", difference);

    }

    makeDatum(roleId: string): INightOrderDatum {

        const {
            store,
            filters,
            added,
            dead,
        } = this;
        const {
            showNotAdded,
            showDead,
        } = filters;

        const addedCount = added[roleId] || 0;
        const deadCount = dead[roleId] || 0;
        const isAdded = (
            addedCount > 0
            || store.isMechanicalRole(store.getRole(roleId))
        );
        const isDead = addedCount > 0 && deadCount >= addedCount;

        const shouldShow = (
            (isAdded && !isDead)
            || (!isAdded && showNotAdded)
            || (isDead && showDead)
        );

        return {
            dead: isDead,
            added: isAdded,
            show: shouldShow,
        };

    }

}
