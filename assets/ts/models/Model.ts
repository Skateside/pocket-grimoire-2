import Observer from "../utilities/Observer";

export default class Model<EventMap = {}> extends Observer<EventMap> {

    load() {
        return Promise.resolve();
    }

    save() {
    }

}
