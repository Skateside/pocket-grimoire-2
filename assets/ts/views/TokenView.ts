import View from "./View";
import {
    IRole,
    ICoordinates,
} from "../types/data";

/**
 * @deprecated
 */
export default class TokenView extends View {

    protected zIndex = 0;

    updateZIndex(zIndex: number | undefined) {
        this.zIndex = Math.max(this.zIndex, zIndex || 0) + 1;
    }

    drawRole(role: IRole, coordinates: ICoordinates, index: number) {
        this.updateZIndex(coordinates.z);
    }

    drawReminder(role: IRole, coordinates: ICoordinates, index: number) {
        this.updateZIndex(coordinates.z);
    }

}
