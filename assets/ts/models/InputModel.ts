import Model from "./Model";

export default class InputModel extends Model<{
}> {

    update(data: Record<string, string | boolean>) {
console.log({ data });
        this.store.update("inputs", data);
    }

    getValues() {
        return this.store.getData("inputs");
    }

}
