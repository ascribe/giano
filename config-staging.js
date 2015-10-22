'use strict';

module.exports = {
    basehost: 'ascribe.ninja',
    jsapp: 'http://ascribe-jsapp.herokuapp.com/',
    django: 'http://ci-ascribe.herokuapp.com/',
    analytics: 'http://ascribe-staging-d3.herokuapp.com/',
    wordpress: 'http://ec2-52-29-65-193.eu-central-1.compute.amazonaws.com/',
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
            if: { path: /^\/api(|\/.*)$/ },
            then: { proxy: '{django}' }
        },
        {
            if: { subdomain: 'www' },
            then: { proxy: '{wordpress}' }
        },
        {
            if: { subdomain: 'analytics' },
            then: { proxy: '{analytics}' }
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
