//-- HACK: We ensure in any environment that Node.js will run on UTC --
process.env.TZ      = "UTC";

var express         = require('express');

var config          = require('./config');
var port            = config.port;
var http            = require('http');
var swig            = require('swig');
var cfg             = require(__dirname + "/config");
var path            = require('path');
var voucherifyClient = require("voucherify");
 
var voucherify = voucherifyClient({
    applicationId: "c70a6f00-cf91-4756-9df5-47628850002b",
    clientSecretKey: "3266b9f8-e246-4f79-bdf0-833929b1380c"
});

var twilio          = require('./twilio'); 

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

var user = "48883660190";

//-- Send SMS with voucher code --
app.post("/voucher-code/:recipient", function(req, res) {
    var phone = req.params.recipient || "48883660190";
    user = phone;

    twilio.send_sms("Ahoy from SaaSTechMeetup! Reply with code: NODEJS to get access to your consultancy service.", user)
        .then(function(result) {
            console.log("[voucher-code][send][sms] Voucher send to User: %s", user);
        })
        .catch(function(error) {
            console.error("[voucher-code][send][sms][error] SMS not sent to User: %s Message: %s Error: %j", user, error, error);
        });

    res.status(200).end("Ok");
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
