const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * Runs webpack build process
 */
const build = async () => {
    console.log("Running webpack production build");
    await exec("npx webpack --config webpack.prod.js");
};

/**
 * Publishes build to npm
 */
const publish = async () => {
    console.log("Publishing to npm");
    await exec("npm publish --access public");
};

module.exports = {
    build,
    publish,
};
