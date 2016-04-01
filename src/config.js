var _               = require('lodash');
var path            = require('path');
var rootPath        = path.normalize(__dirname + '/..');
var fs              = require('fs');

var cfg_path  = path.join(__dirname ,'./config-' + process.env.NODE_ENV  + '.js');
var cfg       = fs.existsSync(cfg_path) ? require(cfg_path) : {};

module.exports = _.merge(
    {
        env: 'production',
        port: process.env.PORT || 8080,
        host: 'placeholder',
        twilio: {
            account_sid: "placeholder",
            auth_token: "placeholder",
            sender: "placeholder",
            caller: "placeholder"
        }
    }, cfg);
