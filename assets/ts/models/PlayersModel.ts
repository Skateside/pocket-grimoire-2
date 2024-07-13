import type {
    IPlayers,
} from "../types/data";
import Model from "./Model";

export default class PlayersModel extends Model<{
    "players-set": IPlayers,
}> {

    ready() {

        this.store.on("players-set", (players) => {
            this.trigger("players-set", players);
        });

    }

    getMaxPlayers() {
        return this.store.getData("settings").maxPlayers;
    }

    getNumbers(players: number) {
        return this.store.getNumbers(players);
    }

    getNames() {
        return this.store.getData("players").names;
    }

    getCount() {
        return this.store.getData("players").count;
    }

    updateCount(count: number) {

        const {
            store,
        } = this;
        const players = store.getData("players");

        if (count === players.count) {
            return;
        }

        players.count = count;
        players.names = (players.names || []).slice(0, count);
        store.setData("players", players);

    }

    updatePlayer(index: number, name: string) {

        const {
            store,
        } = this;
        const players = store.getData("players");

        if (!players.names) {
            players.names = [];
        }

        if (players.names[index] === name) {
            return;
        }

        players.names[index] = name;
        store.setData("players", players);

    }

    removePlayer(index: number) {

        const {
            store,
        } = this;
        const players = store.getData("players");

        if (players.count <= index) {
            return;
        }

        players.count -= 1;
        players.names.splice(index, 1);
        store.setData("players", players);

    }

}
