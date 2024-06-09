import {
    IRole,
    IStore,
} from "./data";

export type ObserverHandler<T extends any = any> = (detail: T) => void;
export type ObserverConverted = (event: Event) => void;

export type IScriptValidatorCheck = {
    id: string,
    test: (roles: IRole[], params?: any[]) => boolean,
    message: string,
    params?: any[],
};

export type IStoreEntry<T> = {
    setData(data: T): void,
    getData(): T,
    reset(): T,
    load(stored: T): T,
    save(): T | null,
};

export type IStoreEntries = {
    [K in keyof IStore]: IStoreEntry<IStore[K]>
};

export type IStoreEntryData = any[] | Record<string, any>;
