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

client.render({url: 'http://google.com', mime: 'application/pdf'}, function(readsteam) {
	
	// do something with the stream.
})
```