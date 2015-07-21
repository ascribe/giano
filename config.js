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
};
