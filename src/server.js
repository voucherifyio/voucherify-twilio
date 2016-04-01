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
app.post("/voucher-code/:recipient/send", function(req, res) {
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

//-- Response to SMS with voucher code --
app.post("/voucher-code/verify", function(req, res) {
    console.log("[voucher-code][verify] Request Body: %j", req.body);
    var code_sender = req.body.From;
    var voucher_code = req.body.Body;

    //Redeem voucher
    voucherify.redeem(voucher_code, code_sender)
        .then(function(result) {
            console.log("[voucher-code] Voucher succesfully redeemed Redemption: %j", result);

            // Make a phone call to customer
            twilio.call(code_sender, "https://" + cfg.host + "/consultancy-call")
                .then(function(result) {
                    console.log("[voucher-code][verify][phone-call] Call made to User: %s", code_sender);
                })
                .catch(function(error) {
                    console.error("[voucher-code][verify][phone-call][error] Call didn't go through User: %s Voucher: %s Message: %s Error: %j", code_sender, voucher_code, error, error);
                });
        })
        .catch(function(error) {
            console.error("[voucher-code][verify][error] Voucher redemption failed User: %s Voucher: %s Message: %s Error: %j", code_sender, voucher_code, error, error);
        });

    res.status(200).end("Ok");
});

function render_html(data, template) {
    var views_path      = path.join(__dirname, "./views/");
    var template_path   = path.join(views_path, template);

    return swig.renderFile(template_path, data);
}

app.post("/consultancy-call", function(req, res) {
    console.log("[consultancy-call] Request Body: %j", req.body);
    var digit = req.body.Digits;

    var options = {
        "1": "redirect.xml",
        "*": "end-call.xml"
    }

    res.type('xml');
    res.status(200).end(render_html({}, options[digit] || "call-center-menu.xml"));
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
