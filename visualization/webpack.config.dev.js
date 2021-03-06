const path = require("path");
const filename = "ancestrySuiteVisualization.min.js";
const library = "ancestrySuiteVisualization";
module.exports = {
    target: "web",
    entry: {
        app:"./index.js"
    },
    output: {
        filename: filename,
        path: path.resolve(__dirname, "build/js"),
        libraryTarget: "var",
        library: library,
    },
    devtool: "inline-source-map",
    devServer: {
        port: 3001,
        publicPath: "/build/js",
        contentBase: path.resolve(__dirname, "./"),
        watchContentBase: true,
        stats: {
            children: false
        }
    }
};
