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

describe('Regression tests', function() {

    describe('AD-647: Giano should ignore query params when matching URLs', function () {

        it('regexp URL rule matches a URL with parameters', function () {
            var reqMatch = prepareReq({url: '/omg-i-love/kyuss?test=foo&bar=baz'}),
                reqFail = prepareReq({url: '/nickelback?whatever=man'}),
                reqHandler = utils.createRule({
                    if: { path: /omg-i-love\/(.*)/ },
                    then: function (context) {
                        (context.matches).should.be.eql(['omg-i-love/kyuss', 'kyuss']);
                    }
                });

            reqHandler(reqMatch)();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('string URL rule matches a URL with parameters', function () {
            var reqMatch = prepareReq({url: '/kyuss-rocks?test=foo&bar=baz'}),
                reqFail = prepareReq({url: '/nickelback?whatever=man'}),
                reqHandler = utils.createRule({
                    if: { path: '/kyuss-rocks' },
                    then: function () { return true; }
                });

            (reqHandler(reqMatch)()).should.be.true();
            should(reqHandler(reqFail)).be.undefined();
        });

        it('does not fail with /?lang=fr parameter', function () {
            var actions = {
                    redirect: function (value, context) {
                        return 'redirect: ' + utils.prepareUrl(value, context);
                    }
                },
                rules = utils.parseConfig({
                    rules: [
                        {
                            if: { path: '/' },
                            then: { redirect: 'https://{subdomain}.example.org/app/{query}' }
                        }
                    ]
                }, actions);

            (rules(prepareReq({
                url: '/?lang=en',
                headers: {
                    host: 'sub.example.org'
                }
            }))()).should.be.equal('redirect: https://sub.example.org/app/?lang=en');
        });

    });
});
