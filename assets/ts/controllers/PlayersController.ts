import PlayersModel from "../models/PlayersModel";
import PlayersView from "../views/PlayersView";
import Controller from "./Controller";

export default class PlayersController extends Controller<PlayersModel, PlayersView> {

    render() {

        super.render();

        const {
            model,
            view,
        } = this;

        view.on("count-update", (number) => model.updateCount(number));
        view.on("name-update", ([index, name]) => {
            model.updatePlayer(index, name);
        });
        view.on("name-remove", (index) => model.removePlayer(index));
        model.on("players-set", (players) => view.updateNames(players));

        view.createNames(model.getMaxPlayers());
        view.setCount(model.getCount());
        view.drawNames(model.getCount());
        view.displayNames(model.getNames());

    }

}
