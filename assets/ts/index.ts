import App from "./classes/App";
import Store from "./classes/Store";
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

const app = new App(new Store());
app
    .addMVC(PlayersModel, PlayersView, PlayersController)
    .addMVC(ScriptModel, ScriptView, ScriptController)
    .addMVC(NightOrderModel, NightOrderView, NightOrderController)
    .addMVC(InfoModel, InfoView, InfoController)
    .addMVC(RoleSelectModel, RoleSelectView, RoleSelectController)
    .addMVC(InputModel, InputView, InputController)
    .addController((store) => {

        const controller = new GrimoireController(
            new GrimoireModel(store),
            new GrimoireView(),
        );

        controller.setMovable(new Movable());

        return controller;

    })
    .run();

console.log({ app });
