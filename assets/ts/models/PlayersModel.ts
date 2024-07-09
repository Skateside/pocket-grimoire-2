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

        players.names[index] = name;
        store.setData("players", players);

    }

}
