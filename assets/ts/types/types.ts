export type IJinx = {
    id: string,
    reason: string,
    state: "theoretical" | "potential" | "active",
};
// state: "theoretical" = this jinx exists but only the role is in the script,
//                        the id mentioned here isn't.
// state: "potential" = the role and the id are both in the script, but they not
//                      both in play.
// state: "active" = both the role and id are in play.

export type ITeam = "townsfolk" | "outsider" | "minion" | "demon" | "traveller" | "fabled";

export type IRole = {
    id: string,
    team: ITeam,
    name: string,
    ability: string,
    image: string,
    edition: string,
    firstNight: number,
    firstNightReminder: string,
    otherNight: number,
    otherNightReminder: string,
    setup: boolean,
    reminders: string[],
    remindersGlobal?: string[],
    jinxes?: IJinx[],
};

export type IData = {
    role: IRole,
    origin: "official" | "homebrew" | "augment",
    inScript: boolean,
    inPlay: number,
    augment?: Partial<IRole>,
    // coordinates?: ICoordinates[], // NOTE: this wouldn't extend to reminder tokens.
};
// origin: "official" = this role came from the database, it's an official role.
// origin: "homebrew" = this role came from the given script.
// origin: "augment" = this role cam from the database but something in the
//                     script added to it or replaced part of it.
//                     This object would also have an `augment` property.

export type IRepository = IData[];

export type IQuerySelectorOptions = Partial<{
    required: boolean,
    root: HTMLElement | Document | null
}>;

export type ObserverHandler<T extends any = any> = (detail: T) => void;
export type ObserverConverted = (event: Event) => void;

export type INights<T> = {
    [K in 'first' | 'other']: T[]
};
export type IRepositoryNights = INights<IData>;
export type IRepositoryNightsRoles = INights<IRole>;

export type IColours = "blue" | "dark-orange" | "dark-purple" | "green" | "grey" | "orange" | "purple" | "red";

export type IInfoData = {
    text: string,
    colour: IColours,
    type: "official" | "homebrew",
    index?: number
}

export type ICoordinates = {
    x: number,
    y: number,
    z?: number,
};

export type IToken = {
    role: IRole,
    coords: ICoordinates,
};

export type IRoleToken = IToken & {
    name?: string,
    isDead: boolean,
    isUpsideDown: boolean,
};

export type IReminderToken = IToken & {
    index: number,
};

export type IStorage = {
    lookup: Record<string, any>,
    repository: Record<string, any>[],
};
