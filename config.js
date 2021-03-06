'use strict';

module.exports = {
    basehost: 'ascribe.io',
    jsapp: 'http://ascribe-prod-jsapp.herokuapp.com/',
    django: 'http://warm-hamlet-6893.herokuapp.com/',
    embed: 'http://ascribe-embed.herokuapp.com/',
    wordpress: 'http://ec2-52-29-65-193.eu-central-1.compute.amazonaws.com/',
    cards: 'http://ascribe-prod-cards.herokuapp.com/',

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
            if: {
                path: /^\/app\/((?:pieces|editions)\/.*)/,
                headers: {'user-agent': /^(facebookexternalhit|Facebot|Twitterbot)/i }
            },
            then: { proxy: '{cards}'}
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
            if: { path: /\/((o|s3|encoder|settings|api)\/|robots\.txt$)/ },
            then: { proxy: '{django}' }
        },
        {
            if: { subdomain: 'www' },
            then: { proxy: '{wordpress}' }
        },
        {
            if: { subdomain: 'blog' },
            then: { redirect: 'https://www.ascribe.io/blog/{path}' }
        },
        {
            if: { path: '/' },
            then: { redirect: 'https://{subdomain}.{basehost}/app/{query}' }
        }
    ]
};
