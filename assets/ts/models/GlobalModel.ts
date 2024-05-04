import Model from "./Model";

export default class GlobalModel extends Model {

    load(): Promise<void> {

        return Promise.all([
            Promise.resolve(this.store.load())
        ]).then(() => {});

    }

};
