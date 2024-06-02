const fs = require("fs");
const {
    deepClone,
    readJSON,
    readJSONSync,
    nameToRole,
    nameToRoleCached,
} = require("./utilities.js");

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

const findNightOrder = () => Promise.all([
    readJSON(`${SOURCE_DATA}night-order.json`),
    readJSON(`${SOURCE_DATA}roles.json`),
]).then(([
    nightOrder,
    roles,
]) => {

    const fullOrder = Object.entries(nightOrder).map(([type, list]) => [
        type,
        list.map((item) => {

            const role = roles.find(({ name }) => name === item);

            return (
                role
                ? role.id
                : item
            );

        }),
    ]);

    return Object.fromEntries(fullOrder);

});

const makeCompleteData = () => Promise.all([
    readJSON(`${SOURCE_DATA}roles.json`),
    readJSON(`${SOURCE_DATA}jinxes.json`),
]).then(([
    roles,
    jinxes,
]) => {

    jinxes.forEach(({ id: targetName, jinx }) => {

        const target = nameToRoleCached(roles, targetName);

        if (!target) {
            throw new Error(`Cannot find target role "${targetName}"`);
        }

        if (!target.jinxes) {
            target.jinxes = [];
        }

        jinx.forEach(({ id: trickName, reason }) => {

            const trick = nameToRoleCached(roles, trickName);

            if (!trick) {
                throw new Error(`Cannot find trick role "${trickName}"`);
            }

            target.jinxes.push({
                id: trick.id,
                reason,
            });

        });

    });

    return roles;

});

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
            const text = readJSONSync(`${LOCALES_DATA}${file}/roles.json`, reject);

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
            const jinxes = readJSONSync(`${LOCALES_DATA}${file}/jinxes.json`, reject);

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
            const scriptNames = readJSONSync(`${LOCALES_DATA}${file}/scripts.json`, reject);

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
            const info = readJSONSync(`${LOCALES_DATA}${file}/info-tokens.json`, reject);

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

module.exports = () => Promise.all([
    makeCompleteData(),
    findNightOrder(),
    readJSON(`${SOURCE_DATA}scripts.json`),
    readJSON(`${SOURCE_DATA}info-tokens.json`),
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
