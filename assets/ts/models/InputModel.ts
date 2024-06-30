import type {
    IInputRecord,
} from "../types/classes";
import Model from "./Model";

export default class InputModel extends Model<{
}> {

    update(data: IInputRecord) {
        this.store.update("inputs", data);
    }

    getValues() {
        return this.store.getData("inputs");
    }

}
