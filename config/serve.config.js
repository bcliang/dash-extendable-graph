const baseConfig = require('./webpack.config.js');
const merge = require('webpack-merge');
const {WebpackPluginServe: Serve} = require('webpack-plugin-serve');

const serve = new Serve({
    host: 'localhost',
    static: ['./'],
    open: false,
    liveReload: true,
});

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {
        app: ['./src/demo/index.js'],
    },
    plugins: [serve],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
        ],
    },
    watch: true,
});
