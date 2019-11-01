const baseConfig = require('./webpack.config.js');
const merge = require('webpack-merge');
const path = require('path');
const {WebpackPluginServe: Serve} = require('webpack-plugin-serve');
const WebpackDashDynamicImport = require('@plotly/webpack-dash-dynamic-import');

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
    plugins: [serve, new WebpackDashDynamicImport()],
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
    optimization: {
        splitChunks: {
            name: true,
            cacheGroups: {
                async: {
                    chunks: 'async',
                    minSize: 0,
                    name(module, chunks, cacheGroupKey) {
                        return `${cacheGroupKey}~${chunks[0].name}`;
                    },
                },
            },
        },
    },
    watch: true,
});
