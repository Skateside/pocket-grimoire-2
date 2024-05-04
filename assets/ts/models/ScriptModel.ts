import Model from "./Model";
import {
    defers,
} from "../utilities/global";

export default class ScriptModel extends Model<{
}> {

    load(): Promise<void> {

        return Promise.all([
            defers.scripts,
        ]).then(([
            scripts,
        ]) => {
        });

    }

}

