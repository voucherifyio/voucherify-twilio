var _               = require('lodash');
var path            = require('path');
var rootPath        = path.normalize(__dirname + '/..');
var fs              = require('fs');

var cfg_path  = path.join(__dirname ,'./config-' + process.env.NODE_ENV  + '.js');
var cfg       = fs.existsSync(cfg_path) ? require(cfg_path) : {};

/**
 * Load environment configuration - set NODE_ENV variable to load specific conf file
 */
module.exports = _.merge(
    {
        env: 'production',
        port: process.env.PORT || 8080,
        host: '776d9f90.ngrok.io',
        twilio: {
            account_sid: "ACcfc445f09f9d5f1642aee43dec676a39",
            auth_token: "4f189034deda806aa76f9334a0174140",
            sender: "+48799449674",
            caller: "+48718811026"
        }
    }, cfg);
