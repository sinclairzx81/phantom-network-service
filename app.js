var phantom = require('phantom.net')

var server = new phantom.Server(5000)

console.log('server listening on port 5000')

var client = new phantom.Client('http://localhost:5000')

client.render({url: 'http://google.com', mime: 'application/pdf'}, function(readsteam) {

})

