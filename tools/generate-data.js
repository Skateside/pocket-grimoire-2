const fs = require("fs");

const SOURCE_DATA = "./assets/data/raw/";
const LOCALES_DATA = "./assets/data/locales/";
const DESTINATION_DATA = "./dist/assets/data/";

// TODO: Change this so that it loops through the `assets/data/locales` folders
// and creates a full data file that contains the roles, scripts, and info tokens.
// Also: change en_GB so that it's formatted (to match the others).

const makeDirectory = () => new Promise((resolve) => {

    fs.mkdirSync(DESTINATION_DATA, {
        recursive: true,
    });
    // fs.mkdirSync(DESTINATION_CHARACTERS, {
    //     recursive: true,
    // });
    // fs.mkdirSync(DESTINATION_SCRIPTS, {
    //     recursive: true,
    // });
    resolve();

});

const getScripts = () => new Promise((resolve, reject) => {

    fs.readFile(`${SOURCE_DATA}scripts.json`, (err, data) => {

        if (err) {
            return reject(err);
        }

        try {
            return resolve(JSON.parse(data));
        } catch (ignore) {
            reject(`Unable to parse "${SOURCE_DATA}scripts.json"`);
        }

    });

});

const findNightOrder = () => new Promise((resolve, reject) => {

    fs.readFile(`${SOURCE_DATA}night-order.json`, (err, data) => {

        if (err) {
            return reject(err);
        }

        const nightOrder = JSON.parse(data);

        fs.readFile(`${SOURCE_DATA}roles.json`, (err, data) => {

            if (err) {
                return reject(err);
            }

            const roles = JSON.parse(data);
            const fullOrder = Object.fromEntries(
                Object
                    .entries(nightOrder)
                    .map(([type, list]) => {

                        return [
                            type,
                            list.map((item) => {

                                const role = roles.find(
                                    ({ name }) => name === item
                                );

                                return (
                                    role
                                    ? role.id
                                    : item
                                );

                            })
                        ];

                    })
            );

            resolve(fullOrder);

        });

    });

});

const nameToRole = (roles, name) => {

    // const role = roles.find(({ name: roleName }) => {
    return roles.find(({ name: roleName }) => {
            return name === roleName;
    });

    // if (!role) {
    //     throw new ReferenceError(`Cannot find "${name}" role`);
    // }

    // return role;

};

const hasOwn = (
    Object.hasOwn
    || ((object, prop) => Object.prototype.hasOwnProperty.call(object, prop))
);

const memoise = (func, keyer = (...args) => String(args[0])) => {

    const cache = Object.create(null);

    return (...args) => {

        const key = keyer(...args);
        
        if (!hasOwn(cache, key)) {
            cache[key] = func(...args);
        }

        return cache[key];

    };

};

const getRole = memoise(nameToRole, (ignore, name) => name);

const readJson = (path, reject = () => {}) => {

    try {
        return JSON.parse(fs.readFileSync(path));
    } catch (ignore) {
        reject(`Unable to read "${path}"`);
    }

    return null;

};

const makeCompleteData = () => new Promise((resolve, reject) => {

    const roles = readJson(`${SOURCE_DATA}roles.json`, reject);
    const jinxes = readJson(`${SOURCE_DATA}jinxes.json`, reject);
    let killLoop = false;

    jinxes.forEach(({ id: targetName, jinx }) => {

        if (killLoop) {
            return;
        }

        const target = getRole(roles, targetName);

        if (!target) {

            killLoop = true;
            return reject(`Cannot find target role "${targetName}"`);

        }

        if (!target.jinxes) {
            target.jinxes = [];
        }

        let killInnerLoop = false;

        jinx.forEach(({ id: trickName, reason }) => {

            if (killInnerLoop) {
                return;
            }

            const trick = getRole(roles, trickName);

            if (!trick) {

                killLoop = true;
                killInnerLoop = true;
                return reject(`Cannot find trick role "${trickName}"`);

            }

            target.jinxes.push({ id: trick.id, reason });

        });

    });

    resolve(roles);

});

const deepClone = (object) => JSON.parse(JSON.stringify(object));

const createData = (roles, nightOrder, scripts) => new Promise((resolve, reject) => {

    const nighted = deepClone(roles);

    // Update the "firstNight" and "otherNight" values for the roles.
    ["firstNight", "otherNight"].forEach((key) => {

        nightOrder[key].forEach((name, index) => {

            const role = nameToRole(nighted, name);

            if (!role) {
                return;
            }

            role[key] = index;

        });

    });

    fs.readdir(LOCALES_DATA, (err, files) => {

        if (err) {
            return reject(err);
        }

        let killLoop = false;

        files.forEach((file) => {

            if (killLoop) {
                return;
            }

            // Localise the roles.
            const characters = deepClone(nighted);
            const text = readJson(`${LOCALES_DATA}${file}/roles.json`, reject);

            if (!text) {
                killLoop = true;
                return;
            }

            text.forEach(({
                id,
                name,
                ability,
                firstNightReminder,
                otherNightReminder,
                remindersGlobal,
                reminders,
            }) => {

                const role = characters.find(({ id: charId }) => charId === id);
                Object.assign(role, {
                    name,
                    ability,
                    firstNightReminder,
                    otherNightReminder,
                    remindersGlobal,
                    reminders,    
                });

            });

            // Localise the jinxes.
            const jinxes = readJson(`${LOCALES_DATA}${file}/jinxes.json`, reject);

            if (!jinxes) {
                killLoop = true;
                return;
            }

            jinxes.forEach(({
                target: targetId,
                trick: trickId,
                reason,
            }) => {

                const target = characters.find(({ id }) => id === targetId);
                const jinx = target.jinxes.find(({ id }) => id === trickId);
                jinx.reason = reason;

            });

            let fileContents = `PG.roles=${JSON.stringify(characters)};`;

            // Localise the scripts.
            const scriptClone = deepClone(scripts);
            const scriptNames = readJson(`${LOCALES_DATA}${file}/scripts.json`, reject);

            if (!scriptNames) {
                killLoop = true;
                return;
            }

            Object.entries(scriptNames.scripts).forEach(([id, name]) => {

                scriptClone[id].unshift({
                    id: "_meta",
                    name,
                    author: scriptNames.author,
                });

            });

            fileContents += `PG.scripts=${JSON.stringify(scriptClone)};`;

            // Localise the info tokens.
            const info = readJson(`${LOCALES_DATA}${file}/info-tokens.json`, reject);

            if (!info) {
                killLoop = true;
                return;
            }

            fileContents += `PG.info=${JSON.stringify(info)};`;

            // Save the contents.
            fs.writeFile(`${DESTINATION_DATA}${file}.js`, fileContents, (err) => {

                if (err) {
                    killLoop = true;
                    return reject(err);
                }

            });

        });

    });

    resolve();

});

/*
const makeMainData = (store) => Promise.all([

    // Create the characters JSON file.
    new Promise((resolve, reject) => {

        fs.readFile(`${SOURCE_DATA}characters.json`, (err, data) => {

            if (err) {
                return reject(err);
            }

            const characters = JSON.parse(data);
            store.characters = characters;
            const enGB = characters.map(({
                id,
                name,
                ability,
                firstNightReminder,
                otherNightReminder,
                remindersGlobal = [],
                reminders,
            }) => ({
                id,
                name,
                ability,
                firstNightReminder,
                otherNightReminder,
                remindersGlobal,
                reminders,
            })).sort((a, b) => a.id.localeCompare(b.id));
            const json = JSON.stringify(enGB, null, "    ");

            fs.writeFile(`${SOURCE_CHARACTERS}en_GB.json`, json + "\n", (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();

            });

        });

    }),

    // Create the jinxes JSON file.
    new Promise((resolve, reject) => {

        fs.readFile(`${SOURCE_DATA}characters.json`, (err, data) => {

            if (err) {
                return reject(err);
            }

            const characters = JSON.parse(data);

            fs.readFile(`${SOURCE_DATA}jinx.json`, (err, data) => {

                if (err) {
                    return reject(err);
                }

                const enGB = [];
                const jinxes = JSON.parse(data);

                jinxes.forEach(({ id, jinx }) => {

                    const character = nameToCharacter(characters, id);

                    jinx.forEach(({ id, reason }) => {

                        const jinxCharacter = nameToCharacter(characters, id);
                        enGB.push({
                            target: character.id,
                            trick: jinxCharacter.id,
                            reason
                        });

                    });

                });

                const json = JSON.stringify(enGB, null, "    ");

                fs.writeFile(`${SOURCE_JINXES}en_GB.json`, json, (err) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve();

                });

            });

        });

    }),

]);

const makeCharacters = (store) => new Promise((resolve, reject) => {

    const characters = store.characters;
    if (!characters) {
        return reject(new Error("characters haven't been loaded"));
    }

    const nightOrder = store.nightOrder;
    if (!nightOrder) {
        return reject(new Error("nightOrder haven't been loaded"));
    }

    // Update the firstNight/otherNight properties to be up-to-date.
    characters.forEach((character) => {

        const firstNight = nightOrder.firstNight.indexOf(character.id) + 1;
        if (firstNight) {
            character.firstNight = firstNight;
        }

        const otherNight = nightOrder.otherNight.indexOf(character.id) + 1;
        if (otherNight) {
            character.otherNight = otherNight;
        }

    });

    fs.readdir(SOURCE_CHARACTERS, (err, files) => {

        if (err) {
            return reject(err);
        }

        files.forEach((file) => {

            const langCharacters = JSON.parse(JSON.stringify(characters));

            const data = JSON.parse(fs.readFileSync(SOURCE_CHARACTERS + file));
            data.forEach((datum) => {

                const character = langCharacters.find(({ id }) => id === datum.id);

                if (!character) {
                    return reject(`Cannot find character "${datum.id}"`);
                }

                Object.assign(character, datum);

            });

            const jinxes = JSON.parse(fs.readFileSync(SOURCE_JINXES + file));
            jinxes.forEach(({ target, trick, reason }) => {

                const character = langCharacters.find(({ id }) => id === target);

                if (!character) {
                    return reject(`Cannot find character "${datum.id}"`);
                }

                if (!character.jinxes) {
                    character.jinxes = [];
                }

                character.jinxes.push({ id: trick, reason });

            });

            const jsFile = file.replace(/\.json$/, ".js");
            const contents = `PG.roles=${JSON.stringify(langCharacters)};`;
            fs.writeFileSync(DESTINATION_CHARACTERS + jsFile, contents);
            
        });

        resolve();

    });

});

const makeScripts = () => new Promise((resolve, reject) => {

    const scripts = JSON.parse(fs.readFileSync(`${SOURCE_DATA}scripts.json`));

    fs.readdir(SOURCE_CHARACTERS, (err, files) => {

        if (err) {
            return reject(err);
        }

        files.forEach((file) => {

            const langScripts = {};
            const data = JSON.parse(fs.readFileSync(SOURCE_SCRIPTS + file));

            Object.entries(data.scripts).forEach(([id, name]) => {

                langScripts[id] = [
                    {
                        id: "_meta",
                        name,
                        author: data.author
                    },
                    ...scripts[id]
                ];

            });

            const jsFile = file.replace(/\.json$/, ".js");
            const contents = `PG.scripts=${JSON.stringify(langScripts)};`;
            fs.writeFileSync(DESTINATION_SCRIPTS + jsFile, contents);

        });

    });

    resolve();

});
*/

module.exports = () => {

    // const store = Object.create(null);

    return Promise.all([
        makeCompleteData(),
        findNightOrder(),
        getScripts(),
        makeDirectory(),
    ]).then(([
        roles,
        nightOrder,
        scripts,
    ]) => createData(roles, nightOrder, scripts));

    // return Promise.all([
    //     // makeDirectory(),
    //     findNightOrder(store),
    //     makeMainData(store),
    // ]).then(() => Promise.all([
    //     makeCharacters(store),
    //     makeScripts(),
    // ]));

};
