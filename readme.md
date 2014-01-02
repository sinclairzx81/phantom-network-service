### phantom.net

For nodejs developers wanting to run phantomjs as a http web service. Includes both server and client library.

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

phantom.net was written specifically for developers looking to expose phantomjs as a network service. More specifically, having
a shared pdf generation tool for reporting. phantom.net allows developers to pass urls as well as raw html to render. Rendered
results come back readable streams. Useful for writing results to disk, or back out as http response.