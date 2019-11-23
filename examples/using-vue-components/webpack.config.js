const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
};