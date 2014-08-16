var static = require('node-static');
var express = require('express');
var mongo = require('mongoskin');
var bodyParser = require('body-parser');
//
// Create a node-static server instance to serve the './public' folder
//

/*
var file = new static.Server('./app');
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(port);
*/

var gameLogRoutes = require('./routes/gameLog')
var app = express();
var db = mongo.db(process.env.MONGOHQ_URL || "mongodb://localhost:27017/pocketciv", { native_parser: true});

app.use(express.static(__dirname))

app.use(bodyParser.json());

app.use(function(req, res, next) {
    req.db = db;
    next();
});

app.use('/gamelog', gameLogRoutes);


module.exports = app;