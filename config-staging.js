'use strict';

module.exports = {
    basehost: 'ascribe.ninja',
    jsapp: 'http://ascribe-jsapp.herokuapp.com/',
    django: 'http://ci-ascribe.herokuapp.com/',
    rules: [
        {
            if: { path: /^(?:\/art)?\/piece\/(.*?)\/?$/ },
            then: { redirect: 'http://{host}/app/editions/{1}' }
        },
        {
            if: { path: /^\/art\/.*/ },
            then: { redirect: 'http://{host}/app/' }
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
            then: { redirect: 'http://{subdomain}.{basehost}/app/' }
        }
    ]
};
