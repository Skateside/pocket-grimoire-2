import Model from "../models/Model";
import View from "../views/View";

export default class Controller<M extends Model, V extends View> {

    protected model: M;
    protected view: V;

    constructor(model: M, view: V) {
        this.model = model;
        this.view = view;
    }

    getModel() {
        return this.model;
    }

    getView() {
        return this.view;
    }

    render() {

        const {
            model,
            view,
        } = this;

        view.setRequester((method: keyof M, ...args: any[]) => {

            if (typeof model[method] === "function") {
                return model[method](...args);
            }

            console.warn(
                "Unknown method \"%s\" on model %o - returning undefined.",
                method,
                model,
            );

        });
        model.ready();
        view.ready();

    }

}
