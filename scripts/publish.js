const { build, publish } = require("./helpers");

const runPublishProcess = async () => {
    //Make sure to run production build before pushing to npm
    await build();

    //Publish to npm
    await publish();
};

runPublishProcess();
