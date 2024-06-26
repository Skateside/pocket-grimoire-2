const fs = require("fs");

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

const deepClone = (object) => JSON.parse(JSON.stringify(object));

const readJSON = (source) => new Promise((resolve, reject) => {

    fs.readFile(source, (err, data) => {

        if (err) {
            return reject(err);
        }

        try {
            const parsed = JSON.parse(data);
            return resolve(parsed);
        } catch (ignore) {
            return reject(`Unable to parse "${source}"`);
        }

    });

});

const readJSONSync = (path) => {

    try {
        return JSON.parse(fs.readFileSync(path));
    } catch (ignore) {
        throw new Error(`Unable to read "${path}"`);
    }

};

const nameToRole = (roles, name) => {

    const nameMap = {
        "DAWN": "Dawn",
        "DUSK": "Dusk",
        "DEMON": "Demon Info",
        "MINION": "Minion Info",
    };
    name = nameMap[name] || name;

    return roles.find(({ name: roleName }) => name === roleName);

};

const nameToRoleCached = memoise(nameToRole, (ignore, name) => name);

const createCompleteMarker = (size, resolve) => {

    if (size < 1) {
        resolve();
    }

    const list = new Array(size);

    return (index) => {

        list[index] = true;

        if (!list.includes(undefined)) {
            resolve();
        }

    };

};

module.exports = {
    hasOwn,
    memoise,
    deepClone,
    readJSON,
    readJSONSync,
    nameToRole,
    nameToRoleCached,
    createCompleteMarker,
};
