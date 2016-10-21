var express         = require('express');

var config          = require('./config');
var port            = config.port;
var http            = require('http');
var swig            = require('swig');
var cfg             = require(__dirname + "/config");
var path            = require('path');
var voucherifyClient = require("voucherify");
var util            = require("util");
 
var voucherify = voucherifyClient({
    applicationId: "b0214323-77a9-46e9-bd6f-f8a91cca8de9",
    clientSecretKey: "c834d4ea-c0d4-4d7d-ba37-79b47432e80c"
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

var user = "<test_phone_number>";
var crm_user_profile = {
    name: "Tomasz Pindel",
    description: "Test SMS publish",
    email: "tom+sms@voucherify.io"
};


//-- Send SMS with voucher code --
app.post("/voucher-code/:recipient/send", function(req, res) {
    var phone = req.params.recipient;
    user = phone;
    crm_user_profile.source_id = phone;

    voucherify.publish({ campaign: "TEST-SMS", channel: "SMS", customer: crm_user_profile })
        .then(function(result) {
            console.log("[voucher-code][send][sms] We will send voucher Voucher: %j User: %s ", result, user);

            return twilio.send_sms(util.format("Ahoy from Voucherify Team! Reply with code: %s to get access to your consultancy service.", result.code), user);
        })
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
    var code_sender = (req.body.From || "").replace("+", ""); // if phone number will the same like source_id of customer in publish then we will match customers
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
