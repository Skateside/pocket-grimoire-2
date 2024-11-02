import type {
    IStoreEvents,
} from "../types/data";
import Controller from "../controllers/Controller";
import Model from "../models/Model";
import View from "../views/View";
import Store from "./Store";
import Observer from "./Observer";

export type IMakeObserver = <TEventMap = {}>(id?: string, observer?: Observer) => Observer<TEventMap>;

export default class App {

    protected controllers: Record<string, Controller<Model, View>>;
    protected store: Store;
    protected observer: Observer;
    protected makeObserver: IMakeObserver;

    constructor() {
        this.controllers = Object.create(null);
    }

    setStore(store: Store) {
        this.store = store;
        return this;
    }

    setObserverFactory(makeObserver: IMakeObserver) {
        this.makeObserver = makeObserver;
        return this;
    }

    addController(
        id: string,
        controller: Controller<Model, View> | (() => Controller<Model, View>),
    ) {

        this.controllers[id] = (
            typeof controller === "function"
            ? controller()
            : controller
        );

        return this;

    }

    addMVC<M extends Model, V extends View>(
        id: string,
        Model: new () => M,
        View: new () => V,
        Controller: new (model: M, view: V) => Controller<M, V>,
    ) {
        return this.addController(id, new Controller(new Model(), new View()));
    }

    run() {

        this.observer = this.makeObserver("app");

        const {
            store,
            controllers,
            observer,
        } = this;

        store.setObserver(this.makeObserver<IStoreEvents>("store", observer));
        store.ready();

        const wrapper = this.makeObserver("controllers", observer);

        Object.entries(controllers).forEach(([id, controller]) => {

            const controllerObserver = this.makeObserver(id, wrapper);
            const modelObserver = this.makeObserver(
                `${id}-model`,
                controllerObserver,
            );
            const viewObserver = this.makeObserver(
                `${id}-view`,
                controllerObserver,
            );

            controller
                .getModel()
                .setObserver(modelObserver)
                .setStore(store);
            controller
                .getView()
                .setObserver(viewObserver);
            controller.render();

        });

    }

}