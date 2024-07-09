import {
    IStoreEntry,
    IStoreEntryData,
} from "../../types/classes";

export default class StoreEntry<T extends IStoreEntryData> implements IStoreEntry<T> {

    protected data: T;

    constructor(data: Partial<T>) {
        this.setData(data as T);
    }

    getData() {
        return structuredClone(this.data);
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

        return structuredClone(data);

    }

    save(): T | null {
        return structuredClone(this.data);
    }

}
