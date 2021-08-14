const { spawn } = require("child_process");

const spawnAndLogOutPutToConsole = (command, args, message = null) => {
    console.log(message ?? `${command} ${args.join(" ")}`);
    const options = {
        shell: true,
    };
    return new Promise((resolve) => {
        const process = spawn(`${command}`, args, options);
        process.stdout.on("data", (data) => console.log(data.toString()));
        process.stderr.on("data", (data) => console.log(data.toString()));
        process.on("exit", (code) => {
            resolve();
        });
    });
};

/**
 * Runs webpack build process
 */
const build = async () => {
    try {
        await spawnAndLogOutPutToConsole(
            "webpack",
            ["--config", "webpack.prod.js"],
            "Running webpack production build"
        );
    } catch (e) {
        console.log(e);
    }
};

/**
 * Publishes build to npm
 */
const publish = async () => {
    try {
        await spawnAndLogOutPutToConsole(
            "npm",
            ["publish", "--access", "public"],
            "Publishing to npm"
        );
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    build,
    publish,
    spawnAndLogOutPutToConsole,
};
