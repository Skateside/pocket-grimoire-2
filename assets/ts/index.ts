import RepositoryModel from "./models/RepositoryModel";
import InfoModel from "./models/InfoModel";
import TokenModel from "./models/TokenModel";
import NightOrderView from "./views/NightOrderView";
import InfoView from "./views/InfoView";
import TokenView from "./views/TokenView";
import NightOrderController from "./controllers/NightOrderController";
import InfoController from "./controllers/InfoController";
import TokenController from "./controllers/TokenController";

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

    const nightOrderController = new NightOrderController(repositoryModel, nightOrderView);
    const infoController = new InfoController(infoModel, infoView);
    const tokenController = new TokenController(tokenModel, tokenView);
    tokenController.setRoles(repositoryModel.getRoles());

    nightOrderController.render();
    infoController.render();
    tokenController.render();

    console.log({
        nightOrderController,
        infoController,
        tokenController
    });

});
