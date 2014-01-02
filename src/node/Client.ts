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

/// <reference path="references.ts" />

class Client {

    constructor(public host: string) {

    }

    public render(parameter: Parameter, callback: (errors: string[], stream: stream.ReadableStream) => void): void {

        var endpoint = require('url').parse(this.host)

        var json     = JSON.stringify(parameter)

        var options = {

            host   : endpoint.hostname,

            port   : endpoint.port,

            path   : endpoint.path,

            method : 'POST',

            headers: {

                'Content-Type': 'application/json',

                'Content-Length': Buffer.byteLength(json)
            }
        }

        //--------------------------------------------------------------
        // make the http request
        //--------------------------------------------------------------
        var request = require('http').request(options, (response: http.ClientResponse) => {
            
            if(response.statusCode == 500) {

                var buffer = []

                response.setEncoding('utf8')

                response.on('data', (data) => { buffer.push(data) })

                response.on('end',  () => { 
                    
                    var json = buffer.join('')

                    callback(JSON.parse(json), null)
                })

                return
            }

            callback(null, response)
        })

        //--------------------------------------------------------------
        // handle errors
        //--------------------------------------------------------------
        request.on('error', () => {
        
            callback(['error: cannot talk to phantom.net server at ' + this.host], null)
        })

        request.write(json)
        
        request.end()
    }
}