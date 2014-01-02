var phantom = require('./bin/index.js')

var server = new phantom.Server(5000)

console.log('server listening on port 5000')

var client = new phantom.Client('http://localhost:5000')

var content = require('fs').readFileSync('C:/input/html.html', 'utf8')

client.render({content: content, mime: 'application/pdf', timeout: 1660}, function(errors, readstream) {
    
    if (errors) {

        console.log(errors)
        
        return
    }
    
    var stream = require('fs').createWriteStream('C:/input/output.pdf')

    readstream.pipe(stream)
})

