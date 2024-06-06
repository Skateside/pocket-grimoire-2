import {
    IInfoToken,
} from "../types/types";
import StoreEntry from "./StoreEntry";

export default class StoreEntryInfo<T extends IInfoToken[]> extends StoreEntry<T> {

    save() {
        return this.data.filter(({ type }) => type === "custom") as T;
    }

}
