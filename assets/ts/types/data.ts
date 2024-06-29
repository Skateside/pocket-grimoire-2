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

export type IColours = (
    "blue"
    | "dark-orange"
    | "dark-purple"
    | "green"
    | "grey"
    | "orange"
    | "purple"
    | "red"
);

export type ICoordinates = {
    x: number,
    y: number,
    z?: number,
};

export type IGameNumbers = {
    [K in ICoreTeam]: number
}

export type IGameNumbersCollection = Record<number, IGameNumbers>;

// export type ISeat = {
//     coords: ICoordinates,
//     name: string,
//     roleId: string,
// };

// export type IReminder = {
//     id: string,
//     index: number,
//     coords: ICoordinates,
// };

export type Ii18nKeys = (
    "grouptownsfolk"
    | "groupoutsider"
    | "groupminion"
    | "groupdemon"
    | "grouptraveler"
    | "scriptcheckisarray"
    | "scriptcheckhasroles"
    | "scriptcheckrequiredkeys"
    | "scriptcheckrequiredteams"
    | "scriptcheckrecognisedteams"
);

export type IStore = {
    game: IGameNumbersCollection,
    i18n: Record<Ii18nKeys, string>,
    roles: Record<string, IRole>,
    augments: Record<string, Partial<IRole>>,
    script: IScript,
    scripts: IScripts,
    infos: IInfoToken[],
    // seats: ISeat[],
    // reminders: IReminder[],
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
    game: IGameNumbers[],
    i18n: Record<string, string>,
    roles: IRole[],
    scripts: IScripts,
    infos: IInfoToken[],
};

export type INights = "firstNight" | "otherNight";

export type INightOrderEntry = {
    element: HTMLElement,
    placeholder: Comment,
};

export type INightOrderFilters = {
    showNotAdded: boolean,
    showDead: boolean,
};

export type INightOrderDatum = {
    added: boolean,
    dead: boolean,
    show: boolean,
};


// -- Deprecated after this ------------------------------------------------- //

/** @deprecated */
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

/** @deprecated */
export type IRepository = IData[];

/** @deprecated */
// export type INights<T> = {
//     [K in 'first' | 'other']: T[]
// };
/** @deprecated */
export type IRepositoryNights = {};//INights<IData>;
/** @deprecated */
export type IRepositoryNightsRoles = {};//INights<IRole>;

/** @deprecated */
export type IToken = {
    role: IRole,
    coords: ICoordinates,
};

/** @deprecated */
export type IRoleToken = IToken & {
    name?: string,
    isDead: boolean,
    isUpsideDown: boolean,
};

/** @deprecated */
export type IReminderToken = IToken & {
    index: number,
};
