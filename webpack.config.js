// ---------------------------------------------------------------------------
//  webpack.config.js
// ---------------------------------------------------------------------------

    var path = require('path');
    var chalk = require('chalk');
    var webpack = require('webpack');

    var PATHS = {
        APP: path.resolve('./app'),
        STATIC: path.resolve('./static')
    };

    console.log(
        chalk.bgMagenta(' '),
        chalk.grey('Running webpack in'),
        process.env.NODE_ENV,
        chalk.grey('environment')
    );

    module.exports = {
        context: __dirname,
        entry: (process.env.NODE_ENV === 'development') ? [
            'webpack-hot-middleware/client',
            `${PATHS.APP}/index.js`
        ] : `${PATHS.APP}/index.js`,
        devtool: (process.env.NODE_ENV === 'development')
            ? 'cheap-module-source-map'
            : false,
        output: {
            publicPath: '/',
            filename: 'bundle.js',
            path: PATHS.STATIC,
            libraryTarget: 'umd'
        },
        stats: {
            colors: true,
            children: false,
            chunks: false,
            chunkModules: false
        },
        module: {
            loaders: [
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                },
                {
                    test: /\.js$/,
                    include: [path.resolve(PATHS.APP)],
                    loader: 'babel-loader?presets[]=es2015&plugins[]=transform-runtime'
                }
            ]
        },
        resolve: {
            modulesDirectories: ['node_modules', path.resolve('./')]
        },
        plugins: (process.env.NODE_ENV === 'development') ? [
            new webpack.DefinePlugin({
                'process.env': {
                    VERSION: JSON.stringify(process.env.npm_package_version),
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
                }
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.NoErrorsPlugin()
        ] : [
            new webpack.DefinePlugin({
                'process.env': {
                    VERSION: JSON.stringify(process.env.npm_package_version),
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    screw_ie8: true,
                    warnings: false
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.NoErrorsPlugin()
        ]
    };
