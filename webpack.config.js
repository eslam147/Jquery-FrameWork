/**
 * Webpack Configuration for jQuery Framework
 * For building and optimizing the framework for large projects
 */

const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    
    entry: {
        'framework': './vendor/src/js/boot.js',
        'app': './app/Http/controllers/index.js' // Entry point for app controllers
    },
    
    output: {
        path: path.resolve(__dirname, 'public/build'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        publicPath: '/build/'
    },
    
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            // Custom plugin for Laravel-like syntax preprocessing
                            [
                                path.resolve(__dirname, 'vendor/src/js/babel-plugin-laravel-syntax.js'),
                                {}
                            ]
                        ]
                    }
                }
            }
        ]
    },
    
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]vendor[\\/]/,
                    name: 'vendor',
                    priority: 10
                },
                controllers: {
                    test: /[\\/]app[\\/]Http[\\/]controllers[\\/]/,
                    name: 'controllers',
                    priority: 5
                },
                common: {
                    minChunks: 2,
                    name: 'common',
                    priority: 1
                }
            }
        },
        usedExports: true,
        sideEffects: false
    },
    
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.resolve(__dirname, 'app'),
            '@vendor': path.resolve(__dirname, 'vendor')
        }
    },
    
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
    
    performance: {
        hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};

