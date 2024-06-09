import InputProcessor from "./InputProcessor";
import {
    IScript,
} from "../../types/data";
import {
    readUTF8,
} from "../../utilities/strings";

export default class File extends InputProcessor<HTMLInputElement> {

    process() {

        return new Promise<IScript>((resolve, reject) => {

            const reader = new FileReader();

            reader.addEventListener("load", ({ target }) => {

                try {

                    // Accented characters were getting mangled. This fix allows
                    // them to be included. Noticed when trying to upload a
                    // homebrew Spanish script.
                    const json = JSON.parse(readUTF8(target.result as string));
                    resolve(json);

                } catch (error) {
                    reject(error);
                }


            });

            reader.readAsText(this.input.files[0]);

        });

    }

}
