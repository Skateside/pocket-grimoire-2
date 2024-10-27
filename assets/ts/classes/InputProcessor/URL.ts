import InputProcessor from "./InputProcessor";
import {
    IScript,
} from "../../types/data";

export default class URL extends InputProcessor<HTMLInputElement> {

    process() {

        if (!(/^https?:$/).test((new window.URL(window.location.href)).protocol)) {
            return Promise.reject(this.input.dataset.errorOffline || "offline");
        }

        return new Promise<IScript>((resolve, reject) => {

            // TODO: Don't fetch() the URL, fetch a PHP proxy to get around CORS.

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
