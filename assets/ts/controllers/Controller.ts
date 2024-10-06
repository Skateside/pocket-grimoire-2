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

        const {
            model,
            view,
        } = this;

        model.ready();
        view.ready();
        view.setRequester((method: keyof M, ...args: any[]) => (
            typeof model[method] === 'function'
            ? model[method](...args)
            : undefined
        ));

    }

}
