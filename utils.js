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


var ACTIONS = {
    proxy: function(context, req, res) {

    },

    redirect: function(context, req, res) {

    }
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
        return function(req) {
            return execRE(re, req.url);
        };
    },

    subdomain: function(cond) {
        return function(req) {
            var name = req.headers.host.split('.')[0];
            return !!name.match(cond);
        };
    },

    headers: function(cond) {
        return function(req) {
            for (var header in cond) {
                if (req.headers[header] !== cond[header]) {
                    return false;
                }
            }
            return true;
        };
    }
};


var getDynamicContext = function(req) {
    return {
        '@': req.headers.host + req.url,
        'host': req.headers.host,
        'subdomain': req.headers.host.split('.')[0]
    };
};


var createRule = function createRule(rule, context, actions) {
    var f, conds = [];
    actions = actions || ACTIONS;
    context = context || {};

    if (!rule.if) {
        conds.push(RULES.noop());
    } else {
        for (var prop in rule.if) {
            conds.push(RULES[prop](rule.if[prop]));
        }
    }

    f = function(req) {
        var i = 0, cond, _context = {};

        while ((cond = conds[i++])) {
            var r = cond(req);
            if (!r) {
                return false;
            } else if (typeof r === 'object') {
                extend(_context, r);
            }
        }
        return _context;
    };

    return function(req) {
        var _context = f(req);

        if (_context) {
            // TODO: update context with some useful vars
            extend(_context, context);
            extend(_context, getDynamicContext(req));
            return function(res) {
                var func;

                if (typeof rule.then === 'function') {
                    func = rule.then;
                    return func(_context, req, res);
                } else {
                    for (var k in rule.then) {
                        func = actions[k];
                    }

                    if (!func) {
                        throw new Error(format('No action defined for "{0}"', k));
                    }

                    return func(rule.then[k], _context, req, res);
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
module.exports.ACTIONS = ACTIONS;
