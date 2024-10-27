import Controller from "./Controller";
import GrimoireModel from "../models/GrimoireModel";
import GrimoireView from "../views/GrimoireView";
import Movable from "../classes/Movable";

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
            throw new Error("GrimoireController requires Movable");
        }

        movable
            .setSelector(view.getItemSelector())
            .setDimensions(view.getPadDimensions())
            .run();

        movable.on("update", ({ element, coords }) => {
            // model.updateSeat(view.getSeatByElement(element), coords);

            // NOTE: `element` might refer to a seat or a reminder.
            // const details = view.getDetailsByElement(element);
            // if (details.seat) { model.updateSeat(seat, coords); }
            // else if (details.reminder) { model.updateReminder(reminder, coords); }

        });

        // model.on("seat-update", ({ seat, coords }) => {
        //     view.updateSeat(seat, coords);
        // });

        /*
        movable.on("update", ({ element, left, top, zIndex }) => {

            // IDEA 1:
            // The movable should update the model's information when an item is
            // moved.

            const seat = view.getSeatFromElement(element);

            if (!seat) {
                return;
            }

            model.updateSeatPosition(seat, {
                x: left,
                y: top,
                z: zIndex,
            });

            // IDEA 2:
            // When movable updates re-calculates co-ordinates, it should tell
            // the view so that the view can update the element - this way, only
            // the view knows about the elements.

            view.updateSeat(element, {
                x: left,
                y: top,
                z: zIndex,
            });

        });

        // IDEA 2 (continued):
        // The view should update the position of the seat and then report back
        // to the model.
        view.on("seat-update", (seat, coords) => model.updateSeat(seat, coords));
        */

        /*

        // CORRECT PROCESS:
        // Movable updates Model then Model updates View
        // This allows the Model to be the single source of truth and update the
        // Store, while at the same time the View gets updated.

        */

    }

}
