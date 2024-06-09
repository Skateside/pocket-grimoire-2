import {
    IStoreEntry,
    IStoreEntryData,
} from "../../types/data";
import {
    deepClone,
} from "../../utilities/objects";

export default class StoreEntry<T extends IStoreEntryData> implements IStoreEntry<T> {

    protected data: T;

    constructor(data: Partial<T>) {
        this.setData(data as T);
    }

    getData() {
        return deepClone(this.data);
    }

    setData(data: T) {
        this.data = data;
    }

    reset() {

        const {
            data,
        } = this;

        if (Array.isArray(data)) {
            data.length = 0;
        } else {
            Object.keys(data).forEach((key) => delete data[key]);
        }

        return data;

    }

    load(stored: T) {

        const {
            data,
        } = this;

        if (Array.isArray(data) && Array.isArray(stored)) {
            data.push(...stored);
        } else {
            Object.assign(data, stored);
        }

        return deepClone(data);

    }

    save(): T | null {
        return deepClone(this.data);
    }

}
