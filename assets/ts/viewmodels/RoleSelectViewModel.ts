import ViewModel from "./ViewModel";
import GameNumbersModel from "../models/GameNumbersModel";
import RepositoryModel from "../models/RepositoryModel";

export default class RoleSelectViewModel extends ViewModel<{
    game: GameNumbersModel,
    repo: RepositoryModel,
}> {
}
