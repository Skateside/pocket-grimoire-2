import App from "./classes/App";
import Store from "./classes/Store";
// import GlobalModel from "./models/GlobalModel";
// import RepositoryModel from "./models/RepositoryModel";
import ScriptModel from "./models/ScriptModel";
import NightOrderModel from "./models/NightOrderModel";
import InfoModel from "./models/InfoModel";
import RoleSelectModel from "./models/RoleSelectModel";
// import GlobalView from "./views/GlobalView";
import ScriptView from "./views/ScriptView";
import NightOrderView from "./views/NightOrderView";
import InfoView from "./views/InfoView";
import RoleSelectView from "./views/RoleSelectView";
// import EditionView from "./views/EditionView";
// import RoleSelectView from "./views/RoleSelectView";
// import GlobalController from "./controllers/GlobalController";
import ScriptController from "./controllers/ScriptController";
import NightOrderController from "./controllers/NightOrderController";
import InfoController from "./controllers/InfoController";
import RoleSelectController from "./controllers/RoleSelectController";
// import EditionController from "./controllers/EditionController";
// import RoleSelectController from "./controllers/RoleSelectController";
// import global from "./utilities/global";

const app = new App(new Store());
app
    // .addMVC(GlobalModel, GlobalView, GlobalController)
    .addMVC(ScriptModel, ScriptView, ScriptController)
    .addMVC(NightOrderModel, NightOrderView, NightOrderController)
    .addMVC(InfoModel, InfoView, InfoController)
    .addMVC(RoleSelectModel, RoleSelectView, RoleSelectController)
    .run();

console.log({ app });
