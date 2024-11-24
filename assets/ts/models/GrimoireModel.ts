import type {
    IMovable
} from "../types/data";
import Model from "./Model";

export default class GrimoireModel extends Model<{
    moveall: IMovable[],
}> {

    // ready() {
    //     super.ready();
    // }

    addStoreListeners() {

        const {
            store,
        } = this;

        store.on("moveables-set", (moveables) => {
            this.trigger("moveall", moveables);
        });

    }

    updateMovable({ id, x, y, z }: IMovable) {

        const {
            store,
        } = this;
        const moveables = store.getData("moveables");
        const movable = moveables.find(({ id: mID }) => id === mID);
// console.log({ movable, id, x, y, z });
        if (!movable) {
            return;
        }

        Object.assign(movable, { x, y, z });
        store.setData("moveables", moveables);

    }

}
