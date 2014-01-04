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

interface ServerOptions {

    maximum_wait?: number
}

class Server {

    private server: http.Server

    constructor(public port: number, public options: ServerOptions) {

        this.prepare_server_options ()

        this.prepare_temp_directory ()

        this.server = require('http').createServer((request: http.ServerRequest, response: http.ServerResponse) => {

            if(request.url == '/') {

                if(request.method.toLowerCase() == "post") {

                    this.handler(request, response)

                    return
                }
            }

            this.error_handler(403, ['invalid request'], response)
        })
        
        this.server.listen(this.port)       
    }

    /** handle errors */
    private error_handler (statusCode: number, errors: string[], response: http.ServerResponse) : void {
        
        var json = JSON.stringify(errors, null, 4)

        response.writeHead(statusCode, {'Content-Type': 'application/json',  'Content-Length': Buffer.byteLength(json)})
        
        response.write(json)

        response.end()
    }

    /* handle request */
    private handler (request: http.ServerRequest, response: http.ServerResponse) : void {
        
        //----------------------------------------------
        // read json parameter from request body
        //----------------------------------------------        
        
        this.json(request, (errors, parameter) => {

            if(errors) {
            
                this.error_handler(403, errors, response)

                return
            }

            //----------------------------------------------
            // validate parameter
            //---------------------------------------------- 
            
            this.validate(parameter, (errors) => {

                if(errors) {
                    
                    this.error_handler(403, errors, response)

                    return
                }

                //----------------------------------------------
                // call to phantom
                //----------------------------------------------
                
                parameter.handle = paths.temp_directory + this.create_file_handle(parameter.mime)

                this.render(parameter, (errors) => {

                    if(errors) {
            
                        this.error_handler(500, errors, response)

                        return
                    }

                    //----------------------------------------------
                    // ensure that phantom rendered file
                    //----------------------------------------------

                    require('fs').stat(parameter.handle, (error: any, stat: fs.Stats) => {

                        if(error) {
                            
                            this.error_handler(500, ['phantomjs failed to render'], response)

                            return
                        }

                        //----------------------------------------------
                        // write file to http response
                        //----------------------------------------------

                        response.writeHead(200, {'Content-Type': parameter.mime, 'Content-Length': stat.size})

                        var readstream = require('fs').createReadStream(parameter.handle)

                        readstream.pipe(response)

                        readstream.on('end', ()     => {
                            
                            //----------------------------------------------
                            // remove phantom file.
                            //----------------------------------------------
                            require('fs').unlink(parameter.handle, (errors) => {
                            
                                response.end()
                            })
                        })
                    })
                })                     
            })
        })        
    }

    /** reads json post from http request body */
    private json (request: http.ServerRequest, callback: (error: any[], parameter: Parameter) => void) : void {
        
        var buffer = []

        request.setEncoding('utf8')

        request.on('data',  (data) =>  { 
            
            buffer.push(data)
        })
        
        request.on('end', () => { 
            
            try {
            
                var obj = JSON.parse(buffer.join(''))

                callback(null, obj)
            }
            catch(e) {
            
                callback([e.toString()], null)
            }
        })    
    }
    
    /** validates the request parameter */
    private validate (parameter: Parameter, callback: (errors: string[]) => void) : void {

        if(!parameter) {
            
            callback(['parameter is null.'])

            return
        }

        var errors = []

        if(!parameter.url && !parameter.content) { 
            
            errors.push('url or content is required.')    
        }

        if(parameter.url && parameter.content) { 
            
            errors.push('cannot supply both url and content in the same request.')
        }

        if(!parameter.mime) { 
            
            errors.push('mime is required.') 
        }

        if(parameter.wait) {

            if((typeof parameter.wait === "number") && Math.floor(parameter.wait) === parameter.wait) {

                if(parameter.wait > this.options.maximum_wait) {
                    
                    errors.push('wait exceeds maximum allowed wait time. maximum is ' + this.options.maximum_wait.toString() + '.')
                }

                if(parameter.wait < 0) {
                
                    errors.push('wait cannot be a negative value.')
                }
            }
            else {
                
                errors.push('wait is not a integer value.')
            }
        }

        if(parameter.mime)  {
        
            switch(parameter.mime) {
            
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

            return
        }

        callback(null)        
    }

    /** starts phantomjs and sends it the parameter to render. */
    private render (parameter: Parameter, callback: (errors: string[]) => void) : void {
        
        var haserror = false

        var json     = JSON.stringify(parameter)

        var child    = require("child_process").spawn('phantomjs', [ (__dirname + '/render.js'), base64.encode(json) ], {})

        child.stdout.setEncoding('utf8')

        child.stdout.on('data', (data) => {

            console.log(data)
        })

        child.stderr.setEncoding('utf8')

        child.stderr.on('data', (data) => {
            
            haserror = true

            callback([data])
        })

        child.on('close', () => { 
            
            if(!haserror) {

                callback(null) 
            }
        })

        child.on('error', () => {
            
            callback(['phantomjs not installed or not configured in PATH.'])
        })
    }

    /** generates a temporary filename */
    private create_file_handle (mime: string) : string {
            
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

    /** parses the server options */
    private prepare_server_options() : void {
    
        this.options = this.options || {}

        if(!this.options.maximum_wait) {
        
            this.options.maximum_wait = 4000
        }
    }
}
