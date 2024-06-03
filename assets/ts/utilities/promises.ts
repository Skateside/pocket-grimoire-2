/** @deprecated */

import {
    IDefer,
} from "../types/types";

export function defer<T extends any = any>() {

    let res = (value: T | PromiseLike<T>) => {};
    let rej = (reason?: any) => {};

    const promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
    }) as IDefer<T>;

    promise.resolve = (value) => {
        res(value);
    };
    promise.reject = (reason) => {
        rej(reason);
    };

    return promise;

}
