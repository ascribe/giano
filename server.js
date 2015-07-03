var http = require('http'),
    proxy = require('http-proxy').createProxy(),
    rules = require('./rules'),
    nodemailer = require('nodemailer');


var RE = 0, TARGET = 1, HOST = 2,
    hostRegExp = /^https?:\/\/(([^:\/?#]*)(?::([0-9]+))?)/,
    port = process.env.PORT || 8080;


var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GIANO_EMAIL_USER,
        pass: process.env.GIANO_EMAIL_PASS
    }
});


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

proxy.on('error', function (err, req, res) {
    var summary = {
        'error': err.code,
        'url': req.url,
        'method': req.method,
        'headers': req.headers
    };

    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Oopsy, something went wrong. We just sent an email to our ' +
            'development team to report the error.\n' +
            'Try to reload the page anyway.');

    var mailOptions = {
        from: 'Giano <team@ascribe.io>', // sender address
        to: 'alberto@ascribe.io, tim@ascribe.io, dimi@ascribe.io', // list of receivers
        subject: '💀 something bad happened 💀', // Subject line
        text: JSON.stringify(summary, null, '  ')
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

    console.log(summary);
});


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
});

console.log('Starting Giano on port', port);
server.listen(port);
