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

class Server {

    private server: http.Server

    constructor(public port: number) {

        this.prepare_temp_directory()

        this.server = require('http').createServer((request: http.ServerRequest, response: http.ServerResponse) => {

            if(request.url == '/') {

                if(request.method.toLowerCase() == "post") {

                    this.handler(request, response)

                    return
                }
            }

            this.errors(['invalid request'], response)
        })
        
        this.server.listen(this.port)       
    }

    /* handles any errors */
    private errors   (errors: string[], response: http.ServerResponse) : void {
        
        response.writeHead(500, {'Content-Type' : 'application/json'})
        
        response.write(JSON.stringify(errors, null, 4))

        response.end()
    }

    /* handles the request */
    private handler  (request: http.ServerRequest, response: http.ServerResponse) : void {
        
        this.json(request, (errors, message) => {

            if(errors) {
            
                this.errors(errors, response)

                return
            }

            this.validate(message, (errors) => {

                if(errors) {
            
                    this.errors(errors, response)

                    return
                }

                message.handle = paths.temp_directory + this.create_handle(message.mime)

                this.render(message, (errors) => {

                    if(errors) {
            
                        this.errors(errors, response)

                        return
                    }

                    //----------------------------------------------
                    // write to http stream, dispose of file.
                    //----------------------------------------------

                    require('fs').exists(message.handle, (exists: boolean) => {

                        if(!exists) {
                            
                            this.errors(['phantomjs failed to render'], response)

                            return
                        }

                        response.writeHead(200, {'Content-Type' : message.mime})

                        var readstream = require('fs').createReadStream(message.handle)

                        readstream.on('data', (data) => { response.write(data) })

                        readstream.on('end',  () => {
                            
                            require('fs').unlink(message.handle, function (errors) {
                            
                                response.end()
                            })
                        })
                    })
                })                     
            })
        })        
    }

    /** reads the posted string */
    private recv     (request: http.ServerRequest, callback: (error: any, data: string) => void) : void {
        
        var buffer = []

        request.setEncoding('utf8')

        request.on('data',  (data) =>  { buffer.push(data) })

        request.on('error', (error) => { callback(error, null ) })            
        
        request.on('end',   ()      => { callback(null, buffer.join('')) })
    }

    /** parses post as json */
    private json     (request: http.ServerRequest, callback: (error: any, message: Parameter) => void) : void {
        
        this.recv(request, (error, data) => {
            
            if(error)  {

                callback(error, null)

                return
            }

            try {
            
                var obj = JSON.parse(data)

                callback(null, obj)
            }
            catch(e) {
            
                callback([e.toString()], null)
            }
        })      
    }
    
    /** validates the json */
    private validate (message: Parameter, callback: (errors: string[]) => void) : void {

        if(!message) {
            
            callback(['message is null'])

            return
        }

        var errors = []

        if(!message.url && !message.content)  { errors.push(['url or content is required']) }

        if(message.url && message.content)    { errors.push(['cannot supply both url and content in the same request'])}

        if(!message.mime) { errors.push(['mime is required']) }

        if(message.mime)  {
        
            switch(message.mime) {
            
                case 'application/pdf': break;

                case 'image/jpeg':      break;
                
                case 'image/jpg':       break;
                
                case 'image/png':       break;

                case 'image/gif':       break;
                
                default: 

                    errors.push('output mime is invalid.')

                    break;
            }
        }
        
        if(errors.length > 0) {

            callback(errors)
        }

        callback(null)        
    }

    /** renders the page with these parameters */
    private render       (message: Parameter, callback: (errors: string[]) => void) : void {
        
        var haserror = false

        var json = JSON.stringify(message)

	    var child = require("child_process").spawn('phantomjs', [ (__dirname + '/render.js'), base64.encode(json) ], {})

        child.stdout.setEncoding('utf8')

        child.stdout.on('data', (data) => { 
            
            haserror = true

            callback([data]) 
        })

        child.on('close', () => { 
            
            if(!haserror) {

                callback(null) 
            }
        })
    }

    /** generates a temp filename */
    private create_handle (mime: string) : string {
            
        var extension = '.jpg'

        switch(mime) {
        
            case 'application/pdf': extension = '.pdf'; break;
            
            case 'image/png':       extension = '.png'; break;
            
            case 'image/jpg':       extension = '.jpg'; break;
            
            case 'image/jpeg':      extension = '.jpg'; break;
            
            case 'image/gif':       extension = '.gif'; break;
        }

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {

            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)

            return v.toString(16)
        
        }) + extension
    }

    /** prepares temp directory */
    private prepare_temp_directory() : void {
        
        var exists = require('fs').existsSync(paths.temp_directory)
        
        if(exists) {

            var filenames = require('fs').readdirSync(paths.temp_directory)

            for(var i = 0; i < filenames.length; i++) {

                require('fs').unlinkSync(paths.temp_directory + filenames[i])
            }
        }
        else {

            require('fs').mkdirSync(paths.temp_directory)
        }
    }
}
