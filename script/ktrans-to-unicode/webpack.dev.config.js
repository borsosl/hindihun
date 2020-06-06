const path = require('path');

module.exports = {
    entry: './script/ktrans-to-unicode/web-index.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'web')
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    onlyCompileBundledFiles: true
                }
            }
        ]
    }
};
