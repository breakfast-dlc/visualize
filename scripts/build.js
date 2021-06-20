const { build } = require("./helpers");

//Run Web pack build
const runBuildProcess = async () => {
    await build();
};

runBuildProcess();
