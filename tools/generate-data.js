const fs = require("fs");

const SOURCE_DATA = "./assets/data/";
const SOURCE_CHARACTERS = `${SOURCE_DATA}characters/`;
const SOURCE_JINXES = `${SOURCE_DATA}jinxes/`;
const SOURCE_SCRIPTS = `${SOURCE_DATA}scripts/`;
const DESTINATION_DATA = "./dist/assets/data/";
const DESTINATION_CHARACTERS = `${DESTINATION_DATA}characters/`;
const DESTINATION_SCRIPTS = `${DESTINATION_DATA}scripts/`;

const makeDirectory = () => new Promise((resolve) => {

    fs.mkdirSync(DESTINATION_CHARACTERS, {
        recursive: true,
    });
    fs.mkdirSync(DESTINATION_SCRIPTS, {
        recursive: true,
    });
    resolve();

});

const findNightOrder = (store) => new Promise((resolve, reject) => {

    fs.readFile(`${SOURCE_DATA}night-order.json`, (err, data) => {

        if (err) {
            return reject(err);
        }

        const nightOrder = JSON.parse(data);

        fs.readFile(`${SOURCE_CHARACTERS}en_GB.json`, (err, data) => {

            if (err) {
                return reject(err);
            }

            const characters = JSON.parse(data);
            const fullOrder = Object.fromEntries(
                Object
                    .entries(nightOrder)
                    .map(([type, list]) => {

                        return [
                            type,
                            list.map((item) => {

                                const character = characters.find(
                                    ({ name }) => name === item
                                );

                                return (
                                    character
                                    ? character.id
                                    : item
                                );

                            })
                        ];

                    })
            );

            store.nightOrder = fullOrder;
            resolve();

        });

    });

});

const nameToCharacter = (characters, name) => {

    const character = characters.find(({ name: charName }) => {
        return name === charName;
    });

    if (!character) {
        throw new ReferenceError(`Cannot find "${name}" character`);
    }

    return character;

};

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
            const json = JSON.stringify(enGB);

            fs.writeFile(`${SOURCE_CHARACTERS}en_GB.json`, json, (err) => {

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

module.exports = () => {

    const store = Object.create(null);

    return Promise.all([
        makeDirectory(),
        findNightOrder(store),
        makeMainData(store),
    ]).then(() => Promise.all([
        makeCharacters(store),
        makeScripts(),
    ]));

};
