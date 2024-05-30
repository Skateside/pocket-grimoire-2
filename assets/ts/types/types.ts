export type INumeric = number | `${number}`;

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

// Note: Official schema uses "traveler" so I should use it, too.
// https://github.com/ThePandemoniumInstitute/botc-release/blob/main/script-schema.json
export type ICoreTeam = "townsfolk" | "outsider" | "minion" | "demon";
export type IPlayTeam = ICoreTeam | "traveler";
export type ITeam = IPlayTeam | "fabled";

// We might not do much with special rules, but it's worth having them so that
// we can use them in the future, if needed.
export type ISpecial = {
    type: (
        "ability"
        | "reveal"
        | "selection"
        | "signal"
        | "vote"
    ),
    name: (
        "bag-disabled"
        | "bag-duplicate"
        | "card"
        | "distribute-votes"
        | "ghost-votes"
        | "grimoire"
        | "hidden"
        | "player"
        | "pointing"
        | "multiplier"
        | "replace-character"
    ),
    value?: number | string, // string doesn't have to be numeric.
    time?: (
        "pregame"
        | "day"
        | "night"
        | "firstNight"
        | "firstDay"
        | "otherNight"
        | "otherDay"
    ),
    global?: IPlayTeam,
};

export type IRole = {
    id: string,
    team: ITeam,
    name: string,
    ability: string,
    image?: string | [string] | [string, string] | [string, string, string],
    edition?: string,
    firstNight?: number,
    firstNightReminder?: string,
    otherNight?: number,
    otherNightReminder?: string,
    setup?: boolean,
    reminders?: string[],
    remindersGlobal?: string[],
    jinxes?: IJinx[],
    special?: ISpecial[],
};

export type IData = {
    role: IRole,
    origin: "official" | "homebrew" | "augment",
    scriptPos: number,
    inPlay: number,
    inBag: number,
    augment?: Partial<IRole>,
    // coordinates?: ICoordinates[], // NOTE: this wouldn't extend to reminder tokens.
};
// origin: "official" = this role came from the database, it's an official role.
// origin: "homebrew" = this role came from the given script.
// origin: "augment" = this role cam from the database but something in the
//                     script added to it or replaced part of it.
//                     This object would also have an `augment` property.
// scriptPos: the position that this role appears in this script, allowing the
//            roles to be ordered that way.
//            Rather than attempting to enforce SAO, just take the script at
//            face-value.
// inPlay: the number of tokens of this role that have been added to the
//         grimoire pad.
// inBag: the number of tokens of this role that have been added to the bag,
//        ready for players to select.

export type IRepository = IData[];

// export type ISeat = {
//     position: ICoordinates,
//     data?: IData,
//     name?: string,
// };

export type IMetaEntry = {
    id: "_meta",
    name: string,
    author?: string,
    logo?: string,
    background?: string,
    firstNight?: string[],
    otherNight?: string[],
};

export type IMinimumRole = Partial<IRole> & Pick<IRole, "id">;

export type IScript = (string | IMinimumRole | IMetaEntry)[];

export type IScripts = Record<string, IScript>;

export type IQuerySelectorOptions = Partial<{
    required: boolean,
    root: HTMLElement | Document | null,
}>;

export type ObserverHandler<T extends any = any> = (detail: T) => void;
export type ObserverConverted = (event: Event) => void;

export type INights<T> = {
    [K in 'first' | 'other']: T[]
};
export type IRepositoryNights = INights<IData>;
export type IRepositoryNightsRoles = INights<IRole>;

export type IColours = "blue" | "dark-orange" | "dark-purple" | "green" | "grey" | "orange" | "purple" | "red";

/** @deprecated */
export type IInfoData = {
    text: string,
    colour: IColours,
    type: "official" | "homebrew",
    index?: number,
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
    // lookup: Record<string, any>,
    repository: Record<string, any>[],
};

// A Promise variant that can be resolved externally.
export type IDefer<T extends any = any> = Promise<T> & {
    resolve(value: T | PromiseLike<T>): void,
    reject(reason?: any): void,
};

export type IGameNumbers = {
    [K in ICoreTeam]: number
}

export type IGameNumbersCollection = Record<number, IGameNumbers>;

export type IDomLookupCache<T extends HTMLElement = HTMLElement> = (element: HTMLElement) => T;

export type ISeat = {
    coords: ICoordinates,
    name: string,
    roleId: string,
};

export type IReminder = {
    id: string,
    index: number,
    coords: ICoordinates,
};

export type IMeta = {
    ignore?: boolean,
    filter?: (entry: any) => boolean,
};

export type IStore = {
    roles: Record<string, IRole>,
    augments: Record<string, Partial<IRole>>,
    script: IScript,
    scripts: IScripts,
    seats: ISeat[],
    reminders: IReminder[],
    infos: IInfoToken[],
};

export type IStoreEntry<IDataType> = {
    meta: IMeta,
    data: IDataType,
};
export type IStoreEntries = {
    [K in keyof IStore]: IStoreEntry<IStore[K]>
};
export type IStoreEvents = {
    [K in keyof IStore as `${K}-set`]: IStore[K]
};

export type IInfoToken = {
    id: string,
    text: string,
    colour: IColours,
    type: "official" | "custom",
};

export type IPG = {
    roles: Record<string, IRole>,
    scripts: IScripts,
    infos: IInfoToken[],
};

export type IObjectDiff = Record<string, {
    value: any,
    type: "new" | "update",
} | {
    type: "remove",
}>;
