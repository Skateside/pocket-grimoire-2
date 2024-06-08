/** @deprecated */

import {
    deepClone,
} from "./objects";
import {
    IStorage,
} from "../types/utilities";

const defaults: IStorage = {
    // lookup: Object.create(null),
    repository: []
};
const STORAGE_KEY = "pg";// "pocket-grimoire";

function read(): IStorage {

    let storage = {};

    if (Object.hasOwn(window.localStorage, STORAGE_KEY)) {
        storage = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    }

    return {
        ...deepClone(defaults),
        ...storage,
    };

}

function get<K extends keyof IStorage>(key: K): IStorage[K] {
    return read()[key];
}

function set(key: keyof IStorage, value: any) {

    const data = read();
    data[key] = value;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

}

/*
export function fetchFromCache<T>(url: string): Promise<T> {

    const lookup = get("lookup");

    if (Object.hasOwn(lookup, url)) {
        return Promise.resolve(lookup[url] as T);
    }

    return fetch(url)
        .then((response) => response.json())
        .then((json) => {

            set("lookup", {
                ...lookup,
                [url]: json
            });

            return json;

        });

}
*/

export function fetchFromStorage<K extends keyof IStorage>(key: K): Promise<IStorage[K]> {
    return Promise.resolve(get(key));
}

export function updateStorage<K extends keyof IStorage>(key: K, value: any) {
    set(key, value);
}
