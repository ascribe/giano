'use strict';

module.exports = {
    basehost: 'ascribe.ninja',
    jsapp: 'http://ascribe-jsapp.herokuapp.com/',
    django: 'http://ci-ascribe.herokuapp.com/',
    rules: [
        {
            if: { url: /^(?:\/art)?\/piece\/(.*?)\/?$/ },
            then: { redirect: 'http://{host}/app/editions/{1}' }
        },
        {
            if: { url: /^\/art\/.*/ },
            then: { redirect: 'http://{host}/app/' }
        },
        {
            if: { url: /^\/app(|\/.*)$/ },
            then: { proxy: '{jsapp}' }
        },
        {
            if: { subdomain: 'www' },
            then: { proxy: '{django}' }
        },
        {
            if: { url: '/' },
            then: { redirect: 'http://{subdomain}.{basehost}/app/' }
        }
    ]
};
