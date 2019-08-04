const common = require("./webpack.common");

module.exports = {
    ...common,
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        publicPath: "/dist/",
        watchContentBase: true
    }
};