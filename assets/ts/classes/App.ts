import Controller from "../controllers/Controller";
import Model from "../models/Model";
import View from "../views/View";
import Store from "./Store";

export default class App {

    protected store: Store;
    protected constrollers: Controller<Model, View>[];

    constructor(store: Store) {

        this.store = store;
        this.constrollers = [];

    }

    addController(
        controller: Controller<Model, View> | ((store: Store) => Controller<Model, View>),
    ) {

        this.constrollers.push(
            typeof controller === "function"
            ? controller(this.store)
            : controller
        );

        return this;

    }

    addMVC<M extends Model, V extends View>(
        Model: new (store: Store) => M,
        View: new () => V,
        Controller: new (model: M, view: V) => Controller<M, V>,
    ) {

        return this.addController(
            new Controller(new Model(this.store), new View())
        );

    }

    run() {

        this.store.ready();
        this.constrollers.forEach((controller) => controller.render());

    }

}