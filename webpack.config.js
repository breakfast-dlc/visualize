const path = require("path");

module.exports = [
    {
        name: "umd",
        entry: "./src/index.ts",
        devtool: "inline-source-map",
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
        output: {
            filename: "bdlc-visualize.umd.js",
            path: path.resolve(__dirname, "dist"),
            library: {
                name: "BDLCV",
                type: "umd",
            },
            globalObject: "this",
        },
    },
];

module.exports.parallelism = 1;
