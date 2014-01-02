### phantom.net

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

### overview

phantom.net was written specifically for developers looking to expose phantomjs as a network service. The library allows developers to
quickly host phantomjs as a http accessible endpoint, and pass it urls and content to render. phantom.net will respond with readable streams. 
Useful for writing results to disk, or back out as http response.

### parameters

The following outlines the parameter type used when calling client.render(parameter, callback). ? indicates the parameter is optional. The parameter
must contain either url or content. 

For more details on these the these parameters see [here](https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#properties-list).

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