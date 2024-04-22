import {
    // IGameNumbers,
    IGameNumbersCollection,
    INumeric,
} from "../types/types";
import {
    deepClone,
} from "../utilities/objects";
import Model from "./Model";

const gameNumbers: IGameNumbersCollection = {
    5: { "townsfolk": 3, "outsider": 0, "minion": 1, "demon": 1 },
    6: { "townsfolk": 3, "outsider": 1, "minion": 1, "demon": 1 },
    7: { "townsfolk": 5, "outsider": 0, "minion": 1, "demon": 1 },
    8: { "townsfolk": 5, "outsider": 1, "minion": 1, "demon": 1 },
    9: { "townsfolk": 5, "outsider": 2, "minion": 1, "demon": 1 },
   10: { "townsfolk": 7, "outsider": 0, "minion": 2, "demon": 1 },
   11: { "townsfolk": 7, "outsider": 1, "minion": 2, "demon": 1 },
   12: { "townsfolk": 7, "outsider": 2, "minion": 2, "demon": 1 },
   13: { "townsfolk": 9, "outsider": 0, "minion": 3, "demon": 1 },
   14: { "townsfolk": 9, "outsider": 1, "minion": 3, "demon": 1 },
   15: { "townsfolk": 9, "outsider": 2, "minion": 3, "demon": 1 },
};

export default class GameNumbersModel extends Model<{
}> {

    getCollection() {
        return deepClone(gameNumbers);
    }

    getNumbers(players: INumeric) {

        let playerCount = Math.floor(players as number);

        if (Number.isNaN(playerCount)) {
            throw new TypeError(`Unrecognised player count type: ${players}`);
        }

        if (playerCount < 5 || playerCount > 20) {
            throw new RangeError(`Player count must be between 5 and 20 - ${playerCount} given`);
        }

        if (playerCount > 15) {
            playerCount = 15;
        }

        return deepClone(gameNumbers[playerCount]);

    }

}
