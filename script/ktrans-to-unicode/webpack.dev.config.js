const path = require('path');

module.exports = {
    mode: 'production',
    entry: './script/ktrans-to-unicode/web-index.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'web')
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
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
