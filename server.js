'use strict';

var http = require('http'),
    proxy = require('http-proxy').createProxy(),
    config = require('./config'),
    utils = require('./utils'),
    hostRegExp = /^https?:\/\/(([^:\/?#]*)(?::([0-9]+))?)/,
    port = process.env.PORT || 8080;


function getHost(url) {
    var match = url.match(hostRegExp);
    return match && match[2];
}

function logErr(err, req, res) {
    var summary = {
        'error': err,
        'url': req.url,
        'method': req.method,
        'headers': req.headers
    };

    console.log(summary);

    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Oopsy, something went wrong. We just sent an email to our ' +
            'development team to report the error.\n' +
            'Try to reload the page anyway.');
}


var ACTIONS = {
    proxy: function(value, context, req, res) {
        var targetUrl = utils.prepareUrl(value, context),
            targetHost = getHost(targetUrl);

        if (req.headers.referer) {
            req.headers.referer = req.headers.referer.replace(req.headers.host, targetHost);
        }
        req.headers.host = targetHost;

        proxy.web(req, res, {
            target: targetUrl,
            autoRewrite: true
        });
    },

    redirect: function(value, context, req, res) {
        res.writeHead(301, {
            'Location': utils.prepareUrl(value, context),
            'Content-Length': 0
        });
        res.end();
    }

};

proxy.on('error', function(err, req, res) {
    logErr(err.code, req, res);
});

var rules = utils.parseConfig(config, ACTIONS);

var server = http.createServer(function (req, res) {
    var resHandler;

    try {
        resHandler = rules(req);
        resHandler(res);
    } catch (e) {
        logErr(e.message, req, res);
    }
});

console.log('Starting Giano on port', port);
server.listen(port);
