import {
    IStoreEntryData,
} from "../types/types";
import StoreEntry from "./StoreEntry";

export default class StoreEntryUnsavable<T extends IStoreEntryData> extends StoreEntry<T> {

    save(): T | null {
        return null;
    }

    load(ignore: any) {
        return this.getData();
    }

}
