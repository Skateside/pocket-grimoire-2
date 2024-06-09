import InputProcessor from "./InputProcessor";
import {
    IScript,
} from "../../types/data";

export default class Paste extends InputProcessor<HTMLTextAreaElement> {

    process() {

        return new Promise<IScript>((resolve, reject) => {

            try {

                const json = JSON.parse(this.input.value);
                resolve(json);

            } catch (error) {
                reject(error);
            }

        });

    }

}
