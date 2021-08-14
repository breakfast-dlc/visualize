const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { spawnAndLogOutPutToConsole } = require("./helpers");

const argv = yargs(hideBin(process.argv)).argv;

let args = ["start"];

if (argv.debug) {
    args.push("--log-level", "debug");
}

const runTest = async () => {
    //Build classes for coverage
    await spawnAndLogOutPutToConsole(
        `tsc`,
        ["--project", "tsconfig.test.json"],
        "Building for testing"
    );

    //Build for testing
    await spawnAndLogOutPutToConsole(
        `webpack`,
        ["--config", "webpack.dev.js"],
        "Building library for testing"
    );

    //Run tests
    await spawnAndLogOutPutToConsole("karma", args);
};

runTest();
