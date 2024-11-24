import App from "./classes/App";
import Store from "./classes/Store";
import Observer from "./classes/Observer";
// import GlobalModel from "./models/GlobalModel";
// import RepositoryModel from "./models/RepositoryModel";
import PlayersModel from "./models/PlayersModel";
import ScriptModel from "./models/ScriptModel";
import NightOrderModel from "./models/NightOrderModel";
import InfoModel from "./models/InfoModel";
import RoleSelectModel from "./models/RoleSelectModel";
import InputModel from "./models/InputModel";
import GrimoireModel from "./models/GrimoireModel";
// import GlobalView from "./views/GlobalView";
import PlayersView from "./views/PlayersView";
import ScriptView from "./views/ScriptView";
import NightOrderView from "./views/NightOrderView";
import InfoView from "./views/InfoView";
import RoleSelectView from "./views/RoleSelectView";
import InputView from "./views/InputView";
import GrimoireView from "./views/GrimoireView";
// import EditionView from "./views/EditionView";
// import RoleSelectView from "./views/RoleSelectView";
// import GlobalController from "./controllers/GlobalController";
import PlayersController from "./controllers/PlayersController";
import ScriptController from "./controllers/ScriptController";
import NightOrderController from "./controllers/NightOrderController";
import InfoController from "./controllers/InfoController";
import RoleSelectController from "./controllers/RoleSelectController";
import InputController from "./controllers/InputController";
import GrimoireController from "./controllers/GrimoireController";
// import EditionController from "./controllers/EditionController";
// import RoleSelectController from "./controllers/RoleSelectController";
// import global from "./utilities/global";
import Movable from "./classes/Movable";
import {
    PocketGrimoireError,
} from "./errors/errors";

const app = new App();
app
    .setStore(new Store())
    .setObserverFactory(<TEventMap = {}>(id: string, parent?: Observer) => {
        const observer = Observer.createWithId<TEventMap>(id);
        parent?.adopt(observer);
        return observer;
    })
    .addMVC("player", PlayersModel, PlayersView, PlayersController)
    .addMVC("script", ScriptModel, ScriptView, ScriptController)
    .addMVC("night-order", NightOrderModel, NightOrderView, NightOrderController)
    .addMVC("info", InfoModel, InfoView, InfoController)
    .addMVC("role-select", RoleSelectModel, RoleSelectView, RoleSelectController)
    .addMVC("input", InputModel, InputView, InputController)
    .addController("grimoire", () => {

        const controller = new GrimoireController(
            new GrimoireModel(),
            new GrimoireView(),
        );

        controller.setMovable(new Movable());

        return controller;

    });
    // .run();

try {
    app.run();
} catch (error) {

    const exception = error as PocketGrimoireError;

    // This will always be `true` for one of our errors. If we got an error we
    // don't recognise, just pass it through to the browser.
    if (!exception.isPGError) {
        throw exception;
    }

    // TODO: Process the error correctly - see if it's possible to recover from
    // any of them.
    console.error(exception);

}

console.log({ app });
