## phantom.net

For nodejs developers wanting to run [phantomjs](http://phantomjs.org/) as a network service. Includes both server and client library.

#### server

start a phantom.net service on port 5000.

```javascript

var phantom = require('phantom.net')

var server = new phantom.Server(5000)
```

#### client

connect to service and render web page as pdf. 

```javascript
var phantom = require('phantom.net')

var client = new phantom.Client('http://localhost:5000')

var parameter = {url: 'http://google.com', mime: 'application/pdf'}

client.render(parameter, function(readstream) {
	
	// do something with the stream.
})
```

### install

	npm install phantom.net

note: phantomjs needs to be installed on the server machine, and set up as a PATH environment variable.

### contents

* [overview](#overview)
* [render](#render)
* [example](#example)
* [windows performance](#windows_performance)

<a name="overview" />
### overview

phantom.net was written specifically for developers looking to expose phantomjs as a network service. The library allows developers to
quickly host phantomjs as a http accessible endpoint, and pass it urls and content to render. phantom.net will respond with readable streams. 
Useful for writing results to disk, or back out as http response.

<a name="render" />
### render

```javascript
var phantom = require('phantom.net')

var client = new phantom.Client('http://localhost:5000')

var parameter = {url: 'http://google.com', mime: 'application/pdf'}

client.render(parameter, function(readstream) {
	
	var writestream = require('fs').createWriteStream('output.pdf')	

	readstream.pipe(writestream)
})
```

The client render() method accepts a single parameter which is passed to phantomjs for rendering. Below is the parameter definition. When passing
this parameter, either url or content must be set. The mime is required, and can be either 'application/pdf', image/jpg', 'image/png' or 'image/gif'

note: for more details on the following properties, see [here](https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#properties-list).

```typescript
interface Parameter {
    
    content?   : string
	
    url?       : string
        
    mime       : string

	timeout?   : number
	
    viewportSize? : { 
        
        width   : number 
    
        height  : number 
    }
    
    paperSize? : {
        
        width?      : number

        height?     : number

        border?     : string

        format?     : string

        orientation?: string
    }
    
    zoomFactor?  : number

    clipRect? : { 

        top   : number

        left  : number 

        width : number

        height: number 
    }
}
```

<a name="example" />
### example
The following example demonstrates setting up both a phantom.net server (on port 5001) and phantom.net client within the same process. 
We also create a basic nodejs http server (on port 5000) to output the stream returned from phantom.net. 

```javascript

var phantom = require('phantom.net')

var server  = new phantom.Server(5001)

var client  = new phantom.Client("http://localhost:5001")

require('http').createServer(function(req, res) {
	
	var parameter = {url : 'http://google.com',
					 mime : 'application/pdf', 	
					 viewportSize : { width: 1600, height: 1200 } }
	
	client.render(parameter, function(errors, stream) {
		
		res.writeHead(200, {'Content-Type' : parameter.mime})
		
		stream.pipe(res)
	})

}).listen(5000)

console.log('server listening on port 5000')

```
<a name="windows_performance" />
### windows performance

If running the server on a windows machine, rendering may take a considerable amount of time. If this is a issue, 
you can speed things up unchecking 'automatically detect settings' in internet explorers LAN settings, as follows...

* open up internet explorer.
* options > internet options > connections (tab).
* uncheck 'automatically detect settings'.
* click ok.