const path = require("path");
const filename = "TunnelProductions.min.js";
const library = "TunnelProductions";
module.exports = {
    entry: "./index.js",
    output: {
        filename: filename,
        path: path.resolve(__dirname, "build/js"),
        libraryTarget: "var",
        library: library,
    },
    devtool: "inline-source-map"
};
