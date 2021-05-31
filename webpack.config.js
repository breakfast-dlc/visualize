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
            filename: "index.js",
            path: path.resolve(__dirname, "dist"),
            library: {
                name: "Visualize",
                type: "umd",
            },
            globalObject: "this",
        },
    },
];

module.exports.parallelism = 1;
