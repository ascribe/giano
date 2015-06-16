var http = require('http'),
    proxy = require('http-proxy').createProxy(),
    rules = require('./rules');

var RE = 0, TARGET = 1, HOST = 2,
    hostRegExp = /^https?:\/\/(([^:\/?#]*)(?::([0-9]+))?)/,
    port = process.env.PORT || 8080;


function getHost(url) {
    var match = url.match(hostRegExp);
    return match && match[2];
}

function createRules(rules) {
    var i = 0, rule;
    while (rule = rules[i++])
        rule.push(getHost(rule[TARGET]));
    return rules;
}

rules = createRules(rules);

var server = http.createServer(function (req, res) {
    var i = 0, rule;

    while (rule = rules[i++])
        if (req.url.match(rule[RE]))
            break;

    if (req.headers.referer)
        req.headers.referer = req.headers.referer.replace(req.headers.host, rule[HOST]);
    req.headers.host = rule[HOST];

    proxy.web(req, res, {
        target: rule[TARGET],
        autoRewrite: true
    });
})

console.log('Starting Giano on port', port);
server.listen(port);
