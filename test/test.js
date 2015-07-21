'use strict';

var should = require('should');

var utils = require('../utils');


function prepareReq(d) {
    if (!d.headers) {
        d.headers = {};
    }

    if (!d.headers.host) {
        d.headers.host = 'www.example.org';
    }

    return d;
}

describe('utils', function() {

    describe('#createRule()', function () {
        it('returns a function to process a requests', function () {
            var rule = utils.createRule({});
            (rule).should.be.an.instanceOf(Function);
        });
    });

    describe('#createRule({...})', function () {
        it('extracts groups', function () {
            var reqMatch = prepareReq({'url': '/omg-i-love/kyuss'}),
                reqFail = prepareReq({'url': '/nickelback'}),
                reqHandler = utils.createRule({
                    if: { url: /omg-i-love\/(.*)/ },
                    then: function (context) {
                        (context.matches).should.be.eql(['omg-i-love/kyuss', 'kyuss']);
                    }
                });

            reqHandler(reqMatch)();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('matches a catch-all noop rule', function () {
            var req = prepareReq({}),
                reqHandler = utils.createRule({then: function () { return true; }}),
                resHandler = reqHandler(req);

            // we haven't set a "if" part for our rule, so it matches
            // everything
            (resHandler).should.be.an.instanceOf(Function);
            (resHandler()).should.be.true();
        });

        it('matches a header-based rule', function () {
            var reqMatch = prepareReq({headers: {'x-forwarded-proto': 'http'}}),
                reqFail = prepareReq({headers: {'x-forwarded-proto': 'https'}}),
                reqHandler = utils.createRule({
                    if: { headers: {'x-forwarded-proto': 'http'}},
                    then: function () { return true; }
                });

            (reqHandler(reqMatch)()).should.be.true();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('matches a url-based rule', function () {
            var reqMatch = prepareReq({'url': '/kyuss'}),
                reqFail = prepareReq({'url': '/nickelback'}),
                reqHandler = utils.createRule({
                    if: { url: /\/kyuss/ },
                    then: function () { return true; }
                });

            (reqHandler(reqMatch)()).should.be.true();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('matches a subdomain-based rule', function () {
            var reqMatch = prepareReq({headers: {host: 'www.example.com'}}),
                reqFail = prepareReq({headers: {host: 'foo.example.com'}}),
                reqHandler = utils.createRule({
                    if: { subdomain: 'www' },
                    then: function () { return true; }
                });

            (reqHandler(reqMatch)()).should.be.true();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('matches composite rules', function () {
            var reqMatch = prepareReq({url: '/kyuss-rocks', headers: {host: 'www.example.com'}}),
                reqFail = prepareReq({url: '/whatever', headers: {host: 'foo.example.com'}}),
                reqHandler = utils.createRule({
                    if: { subdomain: 'www', url: '/kyuss-rocks' },
                    then: function () { return true; }
                });

            (reqHandler(reqMatch)()).should.be.true();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('matches composite rules again', function () {
            var reqMatch = prepareReq({url: '/', headers: {host: 'www.example.com'}}),
                reqFail = prepareReq({url: '/kyuss-rocks', headers: {host: 'foo.example.com'}}),
                reqHandler = utils.createRule({
                    if: { subdomain: 'www', url: '/' },
                    then: function () { return true; }
                });

            (reqHandler(reqMatch)()).should.be.true();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('compose the right URL', function () {
            var reqMatch = prepareReq({'url': '/omg-i-love/kyuss'}),
                reqHandler = utils.createRule({
                    if: { url: /omg-i-love\/(.*)/ },
                    then: function (context) {
                        return utils.prepareUrl('https://{basehost}/luv/{1}', context);
                    }
                }, {basehost: 'www.example.org'});

            reqHandler(reqMatch)().should.be.equal('https://www.example.org/luv/kyuss');
        });
    });


    describe('#createRules(...)', function () {
        it('matches the right rule', function () {
            var reqMatch = prepareReq({'url': '/yawning-man'}),
                reqFail = prepareReq({'url': '/nope-nope-nope'}),
                rules = utils.createRules([{
                    if: { url: '/kyuss' },
                    then: function () { return 'kyuss'; }
                }, {
                    if: { url: '/yawning-man' },
                    then: function () { return 'yawning-man'; }
                }, {
                    if: { url: '/sleep' },
                    then: function () { return 'sleep'; }
                }]);

            (rules).should.be.an.instanceOf(Function);
            (rules(reqMatch)).should.be.an.instanceOf(Function);
            (rules(reqMatch)()).should.be.equal('yawning-man');

            should(rules(reqFail)).be.undefined();
        });
    });


    describe('#parseConfig(...)', function () {
        it('works perfectly lol', function () {
            var actions = {
                    redirect: function (value, context) {
                        return 'redirect: ' + utils.prepareUrl(value, context);
                    },

                    proxy: function (value, context) {
                        return 'proxy: ' + utils.prepareUrl(value, context);
                    }
                },
                rules = utils.parseConfig({
                    basehost: 'example.org',
                    jsapp: 'http://smelly-penguin-7262.herokuapp.com/',
                    django: 'http://morning-smoke-6893.herokuapp.com/',
                    rules: [{
                            if: { headers: {'x-forwarded-proto': 'http' }},
                            then: { redirect: 'https://{@}' }
                        },
                        {
                            if: { subdomain: 'www', url: /\/app(|\/.*)$/ },
                            then: { proxy: '{jsapp}' }
                        },
                        {
                            if: { subdomain: 'www', url: /\/art\/piece\/(.*)$/ },
                            then: { redirect: 'https://{host}/app/edition/{1}' }
                        },
                        {
                            if: { subdomain: 'www' },
                            then: { proxy: '{django}' }
                        },
                        {
                            if: { url: '/' },
                            then: { redirect: 'https://{subdomain}.{basehost}/app/' }
                        },
                        {
                            then: { proxy: '{jsapp}' }
                        }
                    ]
                }, actions);

            (rules(prepareReq({
                headers: {
                    'x-forwarded-proto': 'http',
                    host: 'www.example.org'
                },
                url: '/'
            }))()).should.be.equal('redirect: https://www.example.org/');

            (rules(prepareReq({
                url: '/app/'
            }))()).should.be.equal('proxy: http://smelly-penguin-7262.herokuapp.com/');

            (rules(prepareReq({
                url: '/art/piece/1234567890'
            }))()).should.be.equal('redirect: https://www.example.org/app/edition/1234567890');

            (rules(prepareReq({
                url: '/tour'
            }))()).should.be.equal('proxy: http://morning-smoke-6893.herokuapp.com/');

            (rules(prepareReq({
                url: '/'
            }))()).should.be.equal('proxy: http://morning-smoke-6893.herokuapp.com/');

            (rules(prepareReq({
                url: '/app/something',
                headers: {
                    host: 'foo.example.org'
                }
            }))()).should.be.equal('proxy: http://smelly-penguin-7262.herokuapp.com/');

            (rules(prepareReq({
                url: '/',
                headers: {
                    host: 'foo.example.org'
                }
            }))()).should.be.equal('redirect: https://foo.example.org/app/');

            (rules(prepareReq({
                url: '/',
                headers: {
                    host: 'foo.example.org'
                }
            }))()).should.be.equal('redirect: https://foo.example.org/app/');

            (rules(prepareReq({
                url: '/app/test',
                headers: {
                    host: 'foo.example.org'
                }
            }))()).should.be.equal('proxy: http://smelly-penguin-7262.herokuapp.com/');
        });
    });

});
