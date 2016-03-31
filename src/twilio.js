var cfg = require("./config");
var client  = require("twilio")(cfg.twilio.account_sid, cfg.twilio.auth_token);

module.exports = {
    send_sms: function(text, recipient, sender) {
        console.info("[twilio] SendSMS to: %s", recipient);
        return client.messages.post({
                to: recipient,
                from: sender || cfg.twilio.sender,
                body: text
            });
    },
    call: function(to, url, caller) {
        console.time("[twilio] Make call to: %s", to);
        return client.makeCall({
                to      : to,
                from    : caller || cfg.twilio.caller,
                url     : url
            });
    }
};