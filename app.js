var phantom = require('./bin/index.js')

var server = new phantom.Server(5000)

console.log('server listening on port 5000')

var client = new phantom.Client('http://sdfsdfds:5000')

client.render({url: 'http://gsdfdsfdoogle.codddsdfsf4m', mime: 'application/pdf'}, function(error, readsteam) {
    
    if (error) {

        console.log(error)
        
        return
    }

    var stream = require('fs').createWriteStream('C:/input/output.pdf')

    readsteam.pipe(stream)
})

