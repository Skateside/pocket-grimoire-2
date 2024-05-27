import Store from "./store/Store";
import GlobalModel from "./models/GlobalModel";
import ScriptModel from "./models/ScriptModel";
// import RepositoryModel from "./models/RepositoryModel";
// import InfoModel from "./models/InfoModel";
// // import TokenModel from "./models/TokenModel";
import GlobalView from "./views/GlobalView";
import ScriptView from "./views/ScriptView";
// import NightOrderView from "./views/NightOrderView";
// import InfoView from "./views/InfoView";
// // import TokenView from "./views/TokenView";
// import EditionView from "./views/EditionView";
// import RoleSelectView from "./views/RoleSelectView";
import GlobalController from "./controllers/GlobalController";
import ScriptController from "./controllers/ScriptController";
// import NightOrderController from "./controllers/NightOrderController";
// import InfoController from "./controllers/InfoController";
// // import TokenController from "./controllers/TokenController";
// import EditionController from "./controllers/EditionController";
// import RoleSelectController from "./controllers/RoleSelectController";
// import global from "./utilities/global";

const store = new Store();
const globalModel = new GlobalModel();
const scriptModel = new ScriptModel();

store.load();//.then(() => {

globalModel.setStore(store);
scriptModel.setStore(store);

const globalView = new GlobalView();
const globalController = new GlobalController(globalModel, globalView);
globalController.render();

const scriptView = new ScriptView();
const scriptController = new ScriptController(scriptModel, scriptView);
scriptController.render();

console.log({ globalController, scriptController });

// });

/*
const globalModel = new GlobalModel();
// const repositoryModel = new RepositoryModel();
// const infoModel = new InfoModel();
// // const tokenModel = new TokenModel();

Promise.all([
    globalModel.load(),
    // repositoryModel.load(),
    // infoModel.load(),
    // // tokenModel.load()
]).then(() => {

    const globalView = new GlobalView();
    // const nightOrderView = new NightOrderView();
    // const infoView = new InfoView();
    // // const tokenView = new TokenView();
    // const editionView = new EditionView();
    // const roleSelectView = new RoleSelectView();

    // const globalController = new GlobalController(globalModel, globalView);
    // const nightOrderController = new NightOrderController(repositoryModel, nightOrderView);
    // const infoController = new InfoController(infoModel, infoView);
    // // const tokenController = new TokenController(tokenModel, tokenView);
    // // tokenController.setRoles(repositoryModel.getRoles());
    // const editionController = new EditionController(repositoryModel, editionView);
    // const roleSelectController = new RoleSelectController(repositoryModel, roleSelectView);

    // globalController.render();
    // nightOrderController.render();
    // infoController.render();
    // // tokenController.render();
    // editionController.render();
    // roleSelectController.render();

    // console.log({
    //     globalController,
    //     nightOrderController,
    //     infoController,
    //     // tokenController,
    //     editionController,
    //     roleSelectController,
    // });

});
*/

/*
import Model from "./models/Model";
import View from "./views/View";
import Controller from "./controllers/Controller";
class App {

    protected controllers: Controller<Model, View>[];
    protected loaders: (() => Promise<any>)[];

    constructor() {

        this.controllers = [];
        this.loaders = [];

    }

    addController(controller: Controller<Model, View>) {
        this.controllers.push(controller);
    }

    addLoader(loader: () => Promise<any>) {
        this.loaders.push(loader);
    }

    load() {

        Promise.all(
            this.loaders.map((loader) => loader("en_GB"))
        ).then(() => {
            this.controllers.forEach((controller) => controller.render());
        });

    }

}

const app = new App();
app.addLoader(() => repositoryModel.load());
app.addLoader(() => infoModel.load());
app.addLoader(() => tokenModel.load());
app.addController(new NightOrderController(repositoryModel, new NightOrderView()));
app.addController(new InfoController(infoModel, new InfoView()));
app.addController(new TokenController(tokenModel, new TokenView()));
app.addController(new EditionController(repositoryModel, new EditionView()));
app.addController(new RoleSelectController(repositoryModel, new RoleSelectView()));
app.load();
*/

// (window as any).PG = global;
