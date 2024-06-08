import {
    IRole,
} from "./data";

export type ObserverHandler<T extends any = any> = (detail: T) => void;
export type ObserverConverted = (event: Event) => void;

export type IScriptValidatorCheck = {
    id: string,
    test: (roles: IRole[], params?: any[]) => boolean,
    message: string,
    params?: any[],
};
