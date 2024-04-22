import Model from "./Model";
import RepositoryModel from "./RepositoryModel";
import Observer from "../utilities/Observer";
import {
    ISeat,
} from "../types/types";

export default class SeatModel extends Model<{
}> {

    protected seats: ISeat[];

    constructor() {
        super();
        this.seats = [];
    }

}

class ViewModel<TModelMap = {}, TEventMap = {}> extends Observer<TEventMap> {

    protected models: TModelMap;

    constructor(models: TModelMap) {
        super();
        this.models = Object.assign(Object.create(null), models);
    }

    getModel<K extends keyof TModelMap>(name: K) {
        return this.models[name];
    }

}


class SeatRolesViewModel extends ViewModel<{
    seat: SeatModel,
    repo: RepositoryModel,
// }, {
}> {

    protected seatModal: SeatModel;

    // setSeatModel

    

}

const seatvm = new SeatRolesViewModel({
    seat: new SeatModel(),
    repo: new RepositoryModel(),
});
seatvm.getModel("repo").on("bag-update", () => {});
