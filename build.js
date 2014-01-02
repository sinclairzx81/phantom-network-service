//-------------------------------------------------------------------------
//
// rasterize build script
//
// requires: TypeScript 0.9.1 command line compiler.
//
//-------------------------------------------------------------------------

var tsc = require('./tools/compiler.js')

var io  = require('./tools/io.js')

//------------------------------------------------------------------------------------
// paths
//------------------------------------------------------------------------------------

var src_directory = './src'

var bin_directory = './bin'

//------------------------------------------------------------------------------------
// build
//------------------------------------------------------------------------------------

io.create_directory(bin_directory);

tsc.build([src_directory + '/node/index.ts'], ['--removeComments'], bin_directory + '/index.js' , function() {

    tsc.build([src_directory + '/phantom/index.ts'], ['--removeComments'], bin_directory + '/render.js' , function() {

        io.license('./license.txt', bin_directory + '/index.js')

        io.copy('./readme.md',      bin_directory + '/readme.md')

        io.copy('./package.json',   bin_directory + '/package.json', function() {

            require('./app.js')
        })
    })
})