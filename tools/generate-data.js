const fs = require("fs");
const {
    deepClone,
    readJSON,
    readJSONSync,
    nameToRole,
    nameToRoleCached,
    createCompleteMarker,
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

const combineRolesAndJinxes = () => Promise.all([
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

const setNightOrders = (roles, nightOrder) => {

    const nighted = deepClone(roles);

    ["firstNight", "otherNight"].forEach((key) => {

        nightOrder[key].forEach((name, index) => {

            const role = nameToRole(nighted, name);

            if (!role) {
                return;
            }

            role[key] = index;

        });

    });

    return nighted;

};

const localiseRoles = (roles, locale) => {

    const localised = deepClone(roles);
    const text = readJSONSync(`${LOCALES_DATA}${locale}/roles.json`);

    text.forEach(({
        id,
        name,
        ability,
        firstNightReminder,
        otherNightReminder,
        remindersGlobal,
        reminders,
    }) => {

        const role = localised.find(({ id: charId }) => charId === id);
        Object.assign(role, {
            name,
            ability,
            firstNightReminder,
            otherNightReminder,
            remindersGlobal,
            reminders,
        });

    });

    return localised;

};

const localiseJinxes = (roles, locale) => {

    const jinxes = readJSONSync(`${LOCALES_DATA}${locale}/jinxes.json`);

    jinxes.forEach(({
        target: targetId,
        trick: trickId,
        reason,
    }) => {

        const target = roles.find(({ id }) => id === targetId);
        const jinx = target.jinxes.find(({ id }) => id === trickId);
        jinx.reason = reason;

    });

    return roles;

};

const localiseScripts = (scripts, locale) => {

    const localisedScripts = deepClone(scripts);
    const scriptNames = readJSONSync(`${LOCALES_DATA}${locale}/scripts.json`);

    Object.entries(scriptNames.scripts).forEach(([id, name]) => {

        localisedScripts[id].unshift({
            id: "_meta",
            name,
            author: scriptNames.author,
        });

    });

    return localisedScripts;

};

const localiseInfoTokens = (infoTokens, locale) => {

    const tokens = deepClone(infoTokens);
    const info = readJSONSync(`${LOCALES_DATA}${locale}/info-tokens.json`);

    Object.entries(info).forEach(([id, text]) => {

        const token = tokens.find(({ id: tokenId }) => tokenId === id);

        if (token) {
            token.text = text;
        }

    });

    return tokens;

};

const createData = ({
    roles,
    nightOrder,
    scripts,
    infoTokens,
}) => new Promise((resolve) => {

    const nighted = setNightOrders(roles, nightOrder);

    fs.readdir(LOCALES_DATA, (err, locales) => {

        if (err) {
            throw err;
        }

        const markResolved = createCompleteMarker(locales.length, resolve);

        locales.forEach((locale, index) => {

            let fileContents = "";

            const localisedRoles = localiseRoles(nighted, locale);
            const localisedFullRoles = localiseJinxes(localisedRoles, locale);
            fileContents += `PG.roles=${JSON.stringify(localisedFullRoles)};`;

            const localisedScripts = localiseScripts(scripts, locale);
            fileContents += `PG.scripts=${JSON.stringify(localisedScripts)};`;

            const localisedInfoTokens = localiseInfoTokens(infoTokens, locale);
            fileContents += `PG.infos=${JSON.stringify(localisedInfoTokens)};`;

            fs.writeFile(
                `${DESTINATION_DATA}${locale}.js`,
                fileContents,
                (err) => {

                    if (err) {
                        throw err;
                    }

                    markResolved(index);

                },
            );

        });

    });

});

module.exports = () => Promise.all([
    combineRolesAndJinxes(),
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
