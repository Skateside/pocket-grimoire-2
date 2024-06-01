import Model from "../models/Model";
import View from "../views/View";

export default class Controller<M extends Model, V extends View> {

    protected model: M;
    protected view: V;

    constructor(model: M, view: V) {
        this.model = model;
        this.view = view;
    }

    render() {

        this.model.ready();
        this.view.ready();

    }

}
