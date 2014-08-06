var static = require('node-static');
//var compass = require('node-compass');
//
// Create a node-static server instance to serve the './public' folder
//
var port = process.env.PORT || 5000;

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(port);
