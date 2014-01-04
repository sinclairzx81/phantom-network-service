/*--------------------------------------------------------------------------

The MIT License (MIT)

Copyright (c) 2013 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

/// <reference path="../common/parameter.ts" />
/// <reference path="../common/base64.ts" />

//-------------------------------------------
// simple declaration
//-------------------------------------------

declare var require;

declare var phantom;

//-------------------------------------------
// format message parameters
//-------------------------------------------

var system    = require('system')

var page      = require('webpage').create()

var json      = base64.decode(system.args[1])

//-------------------------------------------
// parse parameter
//-------------------------------------------

var parameter = <Parameter>JSON.parse(json)

if(!parameter.wait) {

    parameter.wait = 200
}

if(parameter.viewportSize) {

    page.viewportSize = parameter.viewportSize
}

if(parameter.paperSize) {

    page.paperSize = parameter.paperSize
}

if(parameter.zoomFactor) {
    
    page.zoomFactor = parameter.zoomFactor
}

if(parameter.clipRect) {

    page.clipRect = parameter.clipRect
}

//-------------------------------------------
// resources: 
//-------------------------------------------

var resources = []

page.onResourceRequested = (request) => {

    resources[request.id] = request.stage;
}

page.onResourceReceived = (response) => {

    resources[response.id] = response.stage;
}

//-------------------------------------------
// load content: 
//-------------------------------------------

page.onInitialized = () => {

    window.setTimeout(() => {
    
        page.render(parameter.handle)
        
        phantom.exit(1)

    }, parameter.wait)
}

//-------------------------------------------
// load content: 
//-------------------------------------------

if(parameter.content) {

    page.content = parameter.content
}

//-------------------------------------------
// load url: 
//-------------------------------------------
if(parameter.url) {

    page.open(parameter.url, (status:string) => {

        if (status !== 'success') {
        
            system.stderr.write('unable to load url ' + parameter.url)
            
            phantom.exit(1)

            return
        }
    })
}





