'use strict';

module.exports = {
    basehost: 'ascribe.io',
    jsapp: 'http://ascribe-prod-jsapp.herokuapp.com/',
    django: 'http://warm-hamlet-6893.herokuapp.com/',
    rules: [
        {
            if: { headers: {'x-forwarded-proto': 'http' }},
            then: { redirect: 'https://{@}' }
        },
        {
            if: { path: /^(?:\/art)?\/piece\/(.*?)\/?$/ },
            then: { redirect: 'https://{host}/app/editions/{1}{query}' }
        },
        {
            if: { path: /^\/art\/.*/ },
            then: { redirect: 'https://{host}/app/{query}' }
        },
        {
            if: { path: /^\/verify\/?$/ },
            then: { redirect: 'https://{host}/app/verify' }
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
            then: { redirect: 'https://{subdomain}.{basehost}/app/{query}' }
        },
        {
            then: { proxy: '{django}' }
        }
    ]
};
