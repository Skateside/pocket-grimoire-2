import Observer from "../utilities/Observer";

export default class ViewModel<TModelMap = {}, TEventMap = {}> extends Observer<TEventMap> {

    protected models: TModelMap;

    constructor(models: TModelMap) {
        super();
        this.models = Object.assign(Object.create(null), models);
    }

    getModel<K extends keyof TModelMap>(name: K) {
        return this.models[name];
    }

    ready() {
        return;
    }

}
