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

const readJSONSync = (path, reject = () => {}) => {

    try {
        return JSON.parse(fs.readFileSync(path));
    } catch (ignore) {
        reject(`Unable to read "${path}"`);
    }

    return null;

};

const nameToRole = (roles, name) => {
    return roles.find(({ name: roleName }) => name === roleName);
};

const nameToRoleCached = memoise(nameToRole, (ignore, name) => name);

module.exports = {
    hasOwn,
    memoise,
    deepClone,
    readJSON,
    readJSONSync,
    nameToRole,
    nameToRoleCached,
};
