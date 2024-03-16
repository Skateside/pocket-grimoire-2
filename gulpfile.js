const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
// const buffer = require("vinyl-buffer");
const watchify = require("watchify");
const fancyLog = require("fancy-log");
const fs = require("fs");
// const uglify = require("gulp-uglify");
// const noop = require("gulp-noop");

const PATHS = {
    pages: ["src/*.html"],
};

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

gulp.task("html", () => {

    return gulp
        .src(PATHS.pages)
        .pipe(gulp.dest("dist"))

});

function getBrowserify() {

    return browserify({
            basedir: ".",
            debug: process.env.NODE_ENV !== "production",
            // entries: ["assets/ts/index.ts"],
            // entries: [],
            cache: {},
            packageCache: {},
        })
        .plugin("tsify", {
            target: "es6",
        })
        .transform("babelify", {
            presets: ["@babel/preset-env"],
            extensions: [".ts", ".js"],
        });

}

const watchedBrowserify = watchify(getBrowserify());

function bundleTypeScript(settings = {}) {

    const base = (
        settings.watch
        ? watchedBrowserify
        : getBrowserify()
    )

    return base
        // .pipe(source("assets/ts/index.ts"))
        .bundle()
        // .pipe(buffer())
        // .pipe(
        //     process.env.NODE_ENV === "production"
        //     ? uglify()
        //     : noop()
        // )
        // .on("error", fancyLog)
        .pipe(source("assets/js/index.js"))
        .pipe(gulp.dest("dist"));

    // const bundle = base.bundle();

    // if (process.env.NODE_ENV === "production") {
    //     bundle.pipe(uglify());
    // }

    // return bundle
    //     .pipe(source("assets/js/index.js"))
    //     .pipe(gulp.dest("dist"));

}

watchedBrowserify.on("update", () => bundleTypeScript({ watch: true }));
watchedBrowserify.on("log", fancyLog);

gulp.task("scripts", () => bundleTypeScript());
gulp.task("scripts:watch", () => bundleTypeScript({ watch: true }));

gulp.task("dev", gulp.series(
    "env:dev",
    gulp.parallel(
        "html",
        // "data",
        "scripts:watch"
    )
));

gulp.task("prod", gulp.series(
    "env:prod",
    "empty",
    gulp.parallel(
        "html",
        // "data",
        "scripts"
    )
));

// const ts = require("gulp-typescript");
// const tsProject = ts.createProject("tsconfig.json");

// gulp.task("ts", () => {
//     return tsProject
//         .src()
//         .pipe(tsProject())
//         .js
//         .pipe(gulp.dest("dist"));
// });

/*
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

const createdData = Object.create(null);

gulp.task("create-data:mkdir", () => new Promise((resolve) => {

    fs.mkdirSync("./dist/assets/data/characters/", { recursive: true });
    resolve();

}));

gulp.task("create-data:night-order", () => new Promise((resolve, reject) => {

    fs.readFile("./assets/data/night-order.json", (err, data) => {

        if (err) {
            return reject(err);
        }

        const nightOrder = JSON.parse(data);

        fs.readFile("./assets/data/characters/en_GB.json", (err, data) => {

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
            createdData.nightOrder = fullOrder;
            const json = JSON.stringify(fullOrder);

            fs.writeFile("./dist/assets/data/night-order.json", json, (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();

            });

        });

    });

}));

gulp.task("create-data:en_GB", () => Promise.all([

    // Create the characters JSON file.
    new Promise((resolve, reject) => {

        fs.readFile("./assets/data/characters.json", (err, data) => {

            if (err) {
                return reject(err);
            }

            const characters = JSON.parse(data);
            createdData.characters = characters;
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
    // Note: Not sure if I care about this - it might just be handled through translations.
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

gulp.task("create-data:character", () => new Promise((resolve, reject) => {

    const characters = createdData.characters;
    if (!characters) {
        return reject(new Error("characters haven't been loaded"));
    }

    const nightOrder = createdData.nightOrder;
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

            const json = JSON.stringify(langCharacters);

            fs.writeFile(`./dist/assets/data/characters/${file}`, json, (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();

            });

        });

    });

}));

function copyJson(source, destination) {

    return new Promise((resolve, reject) => {

        fs.readFile(source, (err, data) => {

            if (err) {
                return reject(err);
            }

            const parsed = JSON.parse(data);
            const json = JSON.stringify(parsed);

            fs.writeFile(destination, json, (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();

            });

        });

    });

}

gulp.task("create-data:scripts", () => copyJson(
    "./assets/data/scripts.json",
    "./dist/assets/data/scripts.json"
));
gulp.task("create-data:game", () => copyJson(
    "./assets/data/game.json",
    "./dist/assets/data/game.json"
));

gulp.task("data", gulp.series(
    "create-data:mkdir",
    "create-data:night-order",
    "create-data:en_GB",
    gulp.parallel(
        "create-data:character",
        "create-data:scripts",
        "create-data:game"
    )
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
    gulp.parallel(
        "data",
        "scripts"
    )
));

gulp.task("prod", gulp.series(
    "env:prod",
    "empty",
    gulp.parallel(
        "data",
        "scripts"
    )
));
*/
