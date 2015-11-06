/**
 *    ▲
 *   ▲ ▲
 */

'use strict';

var format = require('stringformat');


// http://stackoverflow.com/a/929791/597097
var extend = function(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            if (destination[property]) {
                console.log('Overriding property', property);
            }
            destination[property] = source[property];
        }
    }
    return destination;
};


var execRE = function(re, s) {
    var match = re.exec(s),
        result = [],
        i;

    if (match) {
        for (i = 0; i < match.length; i++) {
            result.push((match[i]));
        }
        if (i !== 1) {
            return {matches: result};
        } else {
            return true;
        }
    }
    return false;
};


var prepareUrl = function(url, context) {
    if (context.matches) {
        url = format.apply(null, Array.prototype.concat(url, context.matches));
    }
    url = format(url, context);

    return url;
};


var RULES = {
    noop: function() {
        return function() {
            return true;
        };
    },

    url: function(cond) {
        var re = cond;
        if (typeof cond === 'string') {
            re = new RegExp('^' + cond + '$');
        }
        return function(context, req) {
            return execRE(re, req.url);
        };
    },

    path: function(cond) {
        var re = cond;
        if (typeof cond === 'string') {
            re = new RegExp('^' + cond + '$');
        }
        return function(context) {
            return execRE(re, context.path);
        };
    },

    subdomain: function(cond) {
        var re = cond;
        if (typeof cond === 'string') {
            re = new RegExp('^' + cond + '$');
        }
        return function(context) {
            return !!execRE(re, context.subdomain);
        };
    },

    headers: function(cond) {
        var re = {};

        for (var header in cond) {
            var condForHeader = cond[header];

            if (typeof condForHeader === 'string') {
                condForHeader = new RegExp('^' + condForHeader + '$');
            }
            re[header] = condForHeader;
        }

        return function(context, req) {
            for (var header in re) {
                var match = execRE(re[header], req.headers[header]);
                if (!match) {
                    return false;
                }
                return true;
            }
        };
    }
};


var getDynamicContext = function(req, ctx) {
    var tokens = req.url.split('?'),
        path = tokens[0],
        query = tokens[1] === undefined ? '' : '?' + tokens[1],
        subdomain, context;

    if (ctx.basehost) {
        subdomain = req.headers.host.replace(ctx.basehost, '');
        if (subdomain.match(/\.$/)) {
            subdomain = subdomain.slice(0, -1);
        }
    } else {
        subdomain = req.headers.host.split('.')[0];
    }

    context = {
        '@': req.headers.host + req.url,
        'host': req.headers.host,
        'subdomain': subdomain,
        'url': req.url,
        'path': path,
        'query': query
    };

    return context;
};


var createRule = function createRule(rule, context, actions) {
    var f, conds = [];
    actions = actions || {};
    context = context || {};

    if (!rule.if) {
        conds.push(RULES.noop());
    } else {
        for (var prop in rule.if) {
            conds.push(RULES[prop](rule.if[prop]));
        }
    }

    f = function(ctx, req) {
        var i = 0, cond, _ctx = {};

        while ((cond = conds[i++])) {
            var r = cond(ctx, req);
            if (!r) {
                return false;
            } else if (typeof r === 'object') {
                extend(_ctx, r);
            }
        }
        return _ctx;
    };

    return function(req) {
        var ctx = {},
            newCtx;

        extend(ctx, context);
        extend(ctx, getDynamicContext(req, ctx));

        newCtx = f(ctx, req);

        if (newCtx) {
            extend(ctx, newCtx);
            return function(res) {
                var func;

                if (typeof rule.then === 'function') {
                    func = rule.then;
                    return func(ctx, req, res);
                } else {
                    for (var k in rule.then) {
                        func = actions[k];
                    }

                    if (!func) {
                        throw new Error(format('No action defined for "{0}"', k));
                    }

                    return func(rule.then[k], ctx, req, res);
                }
            };
        }
    };
};

var createRules = function createRules(rules, context, actions) {
    var funcRules = [], i = 0, rule;

    while ((rule = rules[i++])) {
        funcRules.push(createRule(rule, context, actions));
    }

    return function(req) {
        var j = 0, funcRule, match;

        while ((funcRule = funcRules[j++])) {
            match = funcRule(req);
            if (match) {
                return match;
            }
        }
    };
};

var parseConfig = function parseConfig(config, actions) {
    return createRules(config.rules, config, actions);
};


module.exports.createRule = createRule;
module.exports.createRules = createRules;
module.exports.parseConfig = parseConfig;
module.exports.prepareUrl = prepareUrl;
module.exports.RULES = RULES;
