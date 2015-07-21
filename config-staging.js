'use strict';

module.exports = {
    basehost: 'ascribe.io',
    jsapp: 'http://ascribe-jsapp.herokuapp.com/',
    django: 'http://ci.ascribe.herokuapp.com/',
    rules: [
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
