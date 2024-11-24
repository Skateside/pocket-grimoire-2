import Controller from "./Controller";
import GrimoireModel from "../models/GrimoireModel";
import GrimoireView from "../views/GrimoireView";
import Movable from "../classes/Movable";
import {
    UnsetMovablesError,
} from "../errors/errors";

export default class GrimoireController extends Controller<GrimoireModel, GrimoireView> {

    protected movable: Movable;

    setMovable(moveable: Movable) {
        this.movable = moveable;
    }

    render(): void {

        super.render();

        const {
            model,
            view,
            movable,
        } = this;

        if (!movable) {
            throw new UnsetMovablesError();
        }

        movable
            .setSelector(view.getItemSelector())
            .setDimensions(view.getPadDimensions())
            .run();

        model.on("moveall", (moveables) => {

            moveables.forEach(({ id, x, y, z }) => {

                const element = view.getElementById(id);

                if (element) {
                    movable.moveTo(element, { x, y, z });
                }

            });

        });

        view.on("move", (move) => model.updateMovable(move));
        view.on("resize", (dimensions) => movable.setDimensions(dimensions));

    }

}
