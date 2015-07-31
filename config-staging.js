'use strict';

module.exports = {
    basehost: 'ascribe.ninja',
    jsapp: 'http://ascribe-jsapp.herokuapp.com/',
    django: 'http://ci-ascribe.herokuapp.com/',
    rules: [
        {
            if: { path: /^(?:\/art)?\/piece\/(.*?)\/?$/ },
            then: { redirect: 'http://{host}/app/editions/{1}{query}' }
        },
        {
            if: { path: /^\/art\/.*/ },
            then: { redirect: 'http://{host}/app/{query}' }
        },
        {
            if: { path: /^\/verify\/?$/ },
            then: { redirect: 'http://{host}/app/verify' }
        },
        {
            if: { path: /^\/app(|\/.*)$/ },
            then: { proxy: '{jsapp}' }
        },
        {
            if: { subdomain: 'www' },
            then: { proxy: '{django}' }
        },
        {
            if: { path: '/' },
            then: { redirect: 'http://{subdomain}.{basehost}/app/{query}' }
        },
        {
            then: { proxy: '{django}' }
        }
    ]
};
