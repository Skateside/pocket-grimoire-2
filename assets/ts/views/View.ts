import Observer from "../utilities/Observer";

export default class View<EventMap = {}> extends Observer<EventMap> {

    discoverElements() {
        return;
    }

    addListeners() {
        return;
    }

    ready() {

        this.discoverElements();
        this.addListeners();

    }

}
