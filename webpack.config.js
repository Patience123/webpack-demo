const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === 'development'

const config = {
    entry: {
        main: './src/index.js'
    },

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
        // publicPath: '/'
    },

    module: {
        rules: [
            {
                test: /\.jsx?/,  // 支持 js 和 jsx
                include: [
                    path.resolve(__dirname, 'src'),  // src 目录下的才需要经过 babel-loader 处理
                ],
                use: 'babel-loader',
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            }
        ]
    },

    // 代码模块路径解析的配置
    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname, 'src'),
        ],
        extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
    },

    plugins: [
        new CleanWebpackPlugin(['dist']),
        new htmlWebpackPlugin({
            title: '起步',
            template: './src/index.html',
            filename: 'index.html'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? 'development' : 'production'
            }
        })
    ]
}

// 开发环境
if (isDev) {
    config.module.rules.push({
        test: /\.less$/,
        use: [
            'style-loader',
            'css-loader',
            'less-loader'
        ]
    });
    config.devtool = 'inline-source-map';  // 更好的追踪错误来源于哪个源文件
    config.devServer = {
        // 所有来自 dist/ 目录的文件都做 gzip 压缩和提供为服务
        contentBase: path.join(__dirname, "dist"),
        compress: true, // 开启gzip压缩
        host: 'localhost',
        port: 9000,
        hot: true,  // 启用热模块替换
        open: true,  // 自动打开浏览器
        overlay: true,  // 当出现编译错误时，浏览器会启用错误全屏覆盖
    };
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin()
    );
} else {  // 生产环境
    Object.assign(config.entry, {
        vendor: ['lodash']
    });
    config.output.filename = '[name].[chunkhash].js';
    config.module.rules.push({
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
                "css-loader",
                "less-loader"
            ]
        })
    });
    config.plugins.push(
        new ExtractTextPlugin({
            filename: '[name]-[hash].css'
        }),
        new webpack.HashedModuleIdsPlugin(),
    );
    // 将第三方库 lodash 提取到单独的 vendor chunk 文件中是因为它们很少像本地的源代码
    // 那样频繁修改。因此利用客户端的长效缓存机制，可以通过命中缓存来消除请求，并减少向服
    // 务器获取资源，同时还能保证客户端代码和服务器端代码版本一致。
    let splitConfig = {
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        chunks: "initial",
                        test: "vendor",
                        name: "vendor", // 使用 vendor 入口作为公共部分
                        enforce: true,
                    }
                }
            }
        }
    }
    Object.assign(config, splitConfig);
    config.devtool = 'source-map';
}

module.exports = config;