import Observer from "../classes/Observer";

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

    request(method: PropertyKey, ...args: any[]): any {
        console.warn("Requester has not been set up");
    }

    setRequester(requester: (method: PropertyKey, ...args: any[]) => any) {
        this.request = requester;
    }

}
