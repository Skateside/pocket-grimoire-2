import {
    IInfoToken,
} from "../types/data";
import StoreEntry from "./StoreEntry";

export default class StoreEntryInfo<T extends IInfoToken[]> extends StoreEntry<T> {

    save() {
        return this.data.filter(({ type }) => type === "custom") as T;
    }

}
