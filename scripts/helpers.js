const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * Runs webpack build process
 */
const build = async () => {
    console.log("Running webpack production build");
    try {
        await exec("npx webpack --config webpack.prod.js");
    } catch (e) {
        console.log(e);
    }
};

/**
 * Publishes build to npm
 */
const publish = async () => {
    console.log("Publishing to npm");
    try {
        await exec("npm publish --access public");
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    build,
    publish,
};
