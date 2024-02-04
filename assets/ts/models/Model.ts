import Observer from "../utilities/Observer";

export default class Model<EventMap = {}> extends Observer<EventMap> {

    load(locale?: string) {
        return Promise.resolve();
    }

    save() {
    }

}
