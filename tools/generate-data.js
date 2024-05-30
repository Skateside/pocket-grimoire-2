const fs = require("fs");

const SOURCE_DATA = "./assets/data/raw/";
const LOCALES_DATA = "./assets/data/locales/";
const DESTINATION_DATA = "./dist/assets/data/";

const makeDirectory = () => new Promise((resolve, reject) => {

    fs.mkdir(DESTINATION_DATA, {
        recursive: true,
    }, (err) => {

        if (err) {
            return reject(err);
        }

        resolve();

    });

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

const getInfoTokens = () => new Promise((resolve, reject) => {

    fs.readFile(`${SOURCE_DATA}info-tokens.json`, (err, data) => {

        if (err) {
            return reject(err);
        }

        resolve(JSON.parse(data));

    });

});

const nameToRole = (roles, name) => {
    return roles.find(({ name: roleName }) => name === roleName);
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

const createData = ({
    roles,
    nightOrder,
    scripts,
    infoTokens,
}) => new Promise((resolve, reject) => {

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

        files.forEach((file, index) => {

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
            const tokens = deepClone(infoTokens);
            const info = readJson(`${LOCALES_DATA}${file}/info-tokens.json`, reject);

            if (!info) {
                killLoop = true;
                return;
            }

            Object.entries(info).forEach(([id, text]) => {

                const token = tokens.find(({ id: tokenId }) => tokenId === id);

                if (token) {
                    token.text = text;
                }

            });

            fileContents += `PG.infos=${JSON.stringify(tokens)};`;

            // Save the contents.
            fs.writeFile(`${DESTINATION_DATA}${file}.js`, fileContents, (err) => {

                if (err) {
                    killLoop = true;
                    return reject(err);
                }

            });

            if (index >= files.length - 1) {
                resolve();
            }

        });

    });

});

module.exports = () => {

    return Promise.all([
        makeCompleteData(),
        findNightOrder(),
        getScripts(),
        getInfoTokens(),
        makeDirectory(),
    ]).then(([
        roles,
        nightOrder,
        scripts,
        infoTokens,
    ]) => createData({
        roles,
        nightOrder,
        scripts,
        infoTokens,
    }));

};
