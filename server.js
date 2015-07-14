'use strict';

var http = require('http'),
    proxy = require('http-proxy').createProxy(),
    config = require('./config.json'),
    hostRegExp = /^https?:\/\/(([^:\/?#]*)(?::([0-9]+))?)/,
    port = process.env.PORT || 8080;


function getHost(url) {
    var match = url.match(hostRegExp);
    return match && match[2];
}

function updateConf() {
    for (var subdomain in config.subdomains) {
        for (var i = 0; i < config.subdomains[subdomain].length; i++) {
            config.subdomains[subdomain][i].host = getHost(config.subdomains[subdomain][i].to);
            config.subdomains[subdomain][i].from = new RegExp(config.subdomains[subdomain][i].from);
        }
    }
}

updateConf();


proxy.on('error', function (err, req, res) {
    var summary = {
        'error': err.code,
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
});

function extractSubdomain(host) {
    console.log(host);
    var i = host.indexOf(config.hostname),
        // fallback to default route
        subdomain = 'www';

    if (i > 0) {
        // We need to strip off the final dot
        subdomain = host.substr(0, i - 1);
    }
    return subdomain;
}

function getRules(subdomain) {
    return config.subdomains[subdomain] || config.subdomains['*'];
}

var server = http.createServer(function (req, res) {
    var i = 0,
        subdomain = extractSubdomain(req.headers.host),
        rules = getRules(subdomain),
        rule;

    while (rule = rules[i++])
        if (req.url.match(rule.from))
            break;

    if (req.headers.referer)
        req.headers.referer = req.headers.referer.replace(req.headers.host, rule.host);
    req.headers.host = rule.host

    if (rule.prepend)
        req.url = rule.prepend + req.url;

    proxy.web(req, res, {
        target: rule.to,
        autoRewrite: true
    });
});

console.log('Starting Giano on port', port);
server.listen(port);
