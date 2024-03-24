import RepositoryModel from "./models/RepositoryModel";
import InfoModel from "./models/InfoModel";
import TokenModel from "./models/TokenModel";
import NightOrderView from "./views/NightOrderView";
import InfoView from "./views/InfoView";
import TokenView from "./views/TokenView";
import EditionView from "./views/EditionView";
import RoleSelectView from "./views/RoleSelectView";
import NightOrderController from "./controllers/NightOrderController";
import InfoController from "./controllers/InfoController";
import TokenController from "./controllers/TokenController";
import EditionController from "./controllers/EditionController";
import RoleSelectController from "./controllers/RoleSelectController";
import global from "./utilities/global";

const repositoryModel = new RepositoryModel();
const infoModel = new InfoModel();
const tokenModel = new TokenModel();

Promise.all([
    repositoryModel.load("en_GB"),
    infoModel.load(),
    tokenModel.load()
]).then(() => {

    const nightOrderView = new NightOrderView();
    const infoView = new InfoView();
    const tokenView = new TokenView();
    const editionView = new EditionView();
    const roleSelectView = new RoleSelectView();

    const nightOrderController = new NightOrderController(repositoryModel, nightOrderView);
    const infoController = new InfoController(infoModel, infoView);
    const tokenController = new TokenController(tokenModel, tokenView);
    tokenController.setRoles(repositoryModel.getRoles());
    const editionController = new EditionController(repositoryModel, editionView);
    const roleSelectController = new RoleSelectController(repositoryModel, roleSelectView);

    nightOrderController.render();
    infoController.render();
    tokenController.render();
    editionController.render();
    roleSelectController.render();

    console.log({
        nightOrderController,
        infoController,
        tokenController,
        editionController,
        roleSelectController,
    });

});

/*
import Model from "./models/Model";
import View from "./views/View";
import Controller from "./controllers/Controller";
class App {

    private controllers: Controller<Model, View>[];
    private loaders: ((locale?: string) => Promise<any>)[];

    constructor() {

        this.controllers = [];
        this.loaders = [];

    }

    addController(controller: Controller<Model, View>) {
        this.controllers.push(controller);
    }

    addLoader(loader: (locale?: string) => Promise<any>) {
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
app.addLoader((locale) => repositoryModel.load(locale));
app.addLoader(() => infoModel.load());
app.addLoader(() => tokenModel.load());
app.addController(new NightOrderController(repositoryModel, new NightOrderView()));
app.addController(new InfoController(infoModel, new InfoView()));
app.addController(new TokenController(tokenModel, new TokenView()));
app.addController(new EditionController(repositoryModel, new EditionView()));
app.addController(new RoleSelectController(repositoryModel, new RoleSelectView()));
app.load();
*/

(window as any).PG = global;
