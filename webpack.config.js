const path = require("path");

module.exports = [
    {
        name: "commonjs",
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
            filename: "bundle.js",
            path: path.resolve(__dirname, "dist/commonjs"),
            library: {
                name: "bdlc-audio-visualizers",
                type: "commonjs",
            },
        },
    },
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
            filename: "bundle.js",
            path: path.resolve(__dirname, "dist/umd"),
            library: {
                name: "bdlc-audio-visualizers-umd",
                type: "umd",
            },
            globalObject: "this",
        },
    },
    {
        name: "window",
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
            filename: "bundle.js",
            path: path.resolve(__dirname, "dist/window"),
            library: {
                name: "bdlc_audio_visualizers",
                type: "var",
            },
        },
    },
];

module.exports.parallelism = 1;
