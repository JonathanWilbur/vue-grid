let config = require('./webpack.config.js')

config.entry = {
    'vue-grid-layout': './source/index.ts',
}

config.output = {
    filename: './dist/[name].ts',
    library: 'VueGridLayout',
    libraryTarget: 'umd'
}

module.exports = config;