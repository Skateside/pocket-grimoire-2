const fs = require("fs")
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const rollup = require("gulp-better-rollup");
const rollupBabel = require("rollup-plugin-babel");
const rollupResolve = require("rollup-plugin-node-resolve");
const rollupCommonjs = require("rollup-plugin-commonjs");
const rollupTypescript = require("rollup-plugin-typescript2");
const noop = require("gulp-noop");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");

gulp.task("create-en_GB-data", () => Promise.all([

    // Create the characters JSON file.
    new Promise((resolve, reject) => {

        fs.readFile("./assets/data/characters.json", (err, data) => {

            if (err) {
                return reject(err);
            }

            const characters = JSON.parse(data);
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

            fs.writeFile("./assets/data/characters/en_GB.json", json, (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();

            });

        });

    }),

    // Create the jinxes JSON file.
    new Promise((resolve, reject) => {

        function nameToCharacter(characters, name) {

            const character = characters.find(({ name: charName }) => {
                return name === charName;
            });

            if (!character) {
                throw new ReferenceError(`Cannot find "${name}" character`);
            }

            return character;

        }

        fs.readFile("./assets/data/characters.json", (err, data) => {

            if (err) {
                return reject(err);
            }

            const characters = JSON.parse(data);

            fs.readFile("./assets/data/jinx.json", (err, data) => {

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

                fs.writeFile("./assets/data/jinxes/en_GB.json", json, (err) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve();

                });

            });

        });

    }),

    // Create the Teams JSON file.
    new Promise((resolve, reject) => {

        fs.copyFile(
            "./assets/data/teams.json",
            "./assets/data/teams/en_GB.json",
            (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();

            }
        );

    }),

]));

gulp.task("create-data", () => new Promise((resolve, reject) => {

    fs.readFile("./assets/data/characters.json", (err, data) => {

        if (err) {
            return reject(err);
        }

        const characters = JSON.parse(data);

        fs.readdir("./assets/data/characters/", (err, files) => {

            if (err) {
                return reject(err);
            }

            files.forEach((file) => {

                const langCharacters = JSON.parse(JSON.stringify(characters));

                const data = JSON.parse(
                    fs.readFileSync(`./assets/data/characters/${file}`)
                );

                data.forEach((datum) => {

                    const character = langCharacters.find(({ id }) => id === datum.id);

                    if (!character) {
                        return reject(`Cannot find character "${datum.id}"`);
                    }

                    Object.assign(character, datum);

                });

                const jinxes = JSON.parse(
                    fs.readFileSync(`./assets/data/jinxes/${file}`)
                );

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

                // const json = JSON.stringify(langCharacters, null, "    ");
                const json = JSON.stringify(langCharacters);

                fs.mkdirSync("./dist/assets/data/", { recursive: true });
                fs.writeFile(`./dist/assets/data/${file}`, json, (err) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve();

                });

            });

        });

    });

}));

gulp.task("data", gulp.series(
    "create-en_GB-data",
    "create-data"
));

gulp.task("scripts", () => Promise.all(

    [
        "./assets/ts/index.ts"
    ].map((entryPoint) => new Promise((resolve) => {

        const isProduction = (process.env.NODE_ENV === "production");

        gulp.src(entryPoint)
            .pipe(
                isProduction
                ? noop()
                : sourcemaps.init()
            )
            .pipe(
                rollup({
                    plugins: [
                        rollupTypescript({
                            tsconfigOverride: {
                                compilerOptions: {
                                    inlineSourceMap: !isProduction
                                }
                            }
                        }),
                        rollupBabel({
                            presets: [
                                "@babel/preset-env",
                                "@babel/preset-typescript"
                            ],
                            plugins: ["@babel/plugin-proposal-class-properties"]
                        }),
                        rollupResolve(),
                        rollupCommonjs()
                    ]
                }, {
                    format: "iife",
                    sourcemap: !isProduction
                }).on(
                    "error",
                    notify.onError((err) => "JavaScript Error: " + err.message)
                )
            )
            .pipe(
                isProduction
                ? noop()
                : sourcemaps.write("./")
            )
            .pipe(
                isProduction
                ? uglify()
                : noop()
            )
            .pipe(rename((path) => {

                // Through some quirk of setup/integration, it's not possible to
                // include the sourcemaps inline. The solution is to just
                // replace ".ts" with ".js" and allow the sourcemaps to be
                // external.

                if (path.extname === ".ts") {
                    path.extname = ".js";
                }

                if (path.basename.endsWith(".ts") && path.extname === ".map") {
                    path.basename = path.basename.replace(".ts", ".js");
                }

            }))
            .pipe(gulp.dest("./dist/assets/js/"))
            .on("end", resolve);

    }))

));

gulp.task("env:dev", (callback) => {
    process.env.NODE_ENV = "development";
    callback();
});

gulp.task("env:prod", (callback) => {
    process.env.NODE_ENV = "production";
    callback();
});

gulp.task("empty", (callback) => {

    fs.rmSync("./dist/", {
        force: true,
        recursive: true
    });
    callback();

});

gulp.task("dev", gulp.series(
    "env:dev",
    "scripts"
));

gulp.task("prod", gulp.series(
    "env:prod",
    "empty",
    "scripts"
));
