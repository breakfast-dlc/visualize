const { spawnAndLogOutPutToConsole } = require("./helpers");
spawnAndLogOutPutToConsole(`webpack`, ["--config", "webpack.dev.js", "--watch"]);
