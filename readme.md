### phantom.net

Run phantomjs as a http network service.

#### server

start a phantomjs service on port 5000

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