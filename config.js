'use strict';

module.exports = {
    basehost: 'ascribe.io',
    jsapp: 'http://ascribe-prod-jsapp.herokuapp.com/',
    django: 'http://warm-hamlet-6893.herokuapp.com/',
    embed: 'http://ascribe-embed.herokuapp.com/',
    wordpress: 'http://ec2-52-29-65-193.eu-central-1.compute.amazonaws.com/',

    rules: [
        {
            if: { headers: {'x-forwarded-proto': 'http' }},
            then: { redirect: 'https://{@}' }
        },
        {
            if: { subdomain: 'embed' },
            then: { proxy: '{embed}' }
        },
        {
            if: { subdomain: 'hackathon' },
            then: { redirect: 'https://www.eventbrite.com/e/construct-creators-hack-lab-tickets-18227120809' }
        },
        {
            if: { subdomain: 'www.hackathon' },
            then: { redirect: 'https://www.eventbrite.com/e/construct-creators-hack-lab-tickets-18227120809' }
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
            then: { redirect: 'https://{host}/app/coa_verify' }
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
            if: { path: '/' },
            then: { redirect: 'https://{subdomain}.{basehost}/app/{query}' }
        },
        {
            then: { proxy: '{wordpress}' }
        }
    ]
};
