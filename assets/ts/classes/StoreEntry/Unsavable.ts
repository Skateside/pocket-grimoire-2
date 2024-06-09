import {
    IStoreEntryData,
} from "../../types/data";
import StoreEntry from "./StoreEntry";

export default class Unsavable<T extends IStoreEntryData> extends StoreEntry<T> {

    save(): T | null {
        return null;
    }

    load(ignore: any) {
        return this.getData();
    }

}
