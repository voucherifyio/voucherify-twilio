//-- HACK: We ensure in any environment that Node.js will run on UTC --
process.env.TZ      = "UTC";

var express         = require('express');

var config          = require('./config');
var port            = config.port;
var http            = require('http');
var swig            = require('swig');
var cfg             = require(__dirname + "/config");
var path            = require('path');

var app             = express();

app.configure(function(){
    app.set('port', process.env.PORT || port);

    app.set('views', __dirname + '/views');
    app.engine("html", swig.renderFile);
    app.set("view engine", "html");

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, './../public')));
});

app.get("/ping", function(req, res) {
    res.status(200).end("Ping");
});


http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
