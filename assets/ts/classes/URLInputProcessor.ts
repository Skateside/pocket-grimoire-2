import InputProcessor from "./InputProcessor";
import {
    IScript,
} from "../types/data";

export default class URLInputProcessor extends InputProcessor<HTMLInputElement> {

    process() {

        if (!(/^https?:$/).test((new URL(window.location.href)).protocol)) {
            return Promise.reject(this.input.dataset.errorOffline || "offline");
        }

        return new Promise<IScript>((resolve, reject) => {

            fetch(this.input.value)
                // .catch((error) => reject(error.message))
                .then(
                    (response) => response.json(),
                    (error) => reject(error.message),
                )
                // .catch(() => {
                //     reject(I18N.invalidScript)
                //     return [];
                // })
                .then((json) => resolve(json));

        });

    }

}
