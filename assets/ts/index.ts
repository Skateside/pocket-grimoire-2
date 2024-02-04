import RepositoryModel from "./models/RepositoryModel";
import InfoModel from "./models/InfoModel";
import TokenModel from "./models/TokenModel";
import NightOrderView from "./views/NightOrderView";
import InfoView from "./views/InfoView";
import TokenView from "./views/TokenView";
import NightOrderController from "./controllers/NightOrderController";
import InfoController from "./controllers/InfoController";
import TokenController from "./controllers/TokenController";

/*
import Storage from "./utilities/Storage";
import Lookup from "./utilities/Lookup";
import { IRole } from "./types/types";

    // NOTE: I don't like how the type is now added to this page. I also don't
    // like how Storage and Lookup are in utilities/.
    // Would it be better for each model to have a "lookup" method? If it
    // returned a Promise then we could use Promise.all() in the same way that
    // we are now, and if the method updates the model's data then we can just
    // call its methods to maintain type safety.
const lookup = new Lookup<{
    roles: IRole[],
    info: string[]
}>(new Storage("pg"));

lookup.process({
    roles(resolve) {
        lookup
            .fetch("./assets/data/en_GB.json")
            .then((json) => resolve(json));
    },
    info(resolve) {
        resolve([]);
    }
}).then((data) => {

    // (window as any).repositoryModel.setRoles(data.roles);
    // (window as any).infoModel.setInfos(data.info);

    const repositoryModel = new RepositoryModel();
    const infoModel = new InfoModel();
    const tokenModel = new TokenModel();

    const nightOrderView = new NightOrderView();
    const infoView = new InfoView();
    const tokenView = new TokenView();

    const nightOrderController = new NightOrderController(repositoryModel, nightOrderView);
    const infoController = new InfoController(infoModel, infoView);
    const tokenController = new TokenController(tokenModel, tokenView);
    tokenController.setRoles(repositoryModel.getRoles());

    console.log({
        nightOrderController,
        infoController,
        tokenController
    });

});
/*/
const repositoryModel = new RepositoryModel();
const infoModel = new InfoModel();
const tokenModel = new TokenModel();

Promise.all([
    repositoryModel.lookup("en_GB")
]).then(() => {

    const nightOrderView = new NightOrderView();
    const infoView = new InfoView();
    const tokenView = new TokenView();

    const nightOrderController = new NightOrderController(repositoryModel, nightOrderView);
    const infoController = new InfoController(infoModel, infoView);
    const tokenController = new TokenController(tokenModel, tokenView);
    tokenController.setRoles(repositoryModel.getRoles());

    console.log({
        nightOrderController,
        infoController,
        tokenController
    });

});
//*/
