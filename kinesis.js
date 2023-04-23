const Twit = require('twit');
const AWS = require('aws-sdk'),
    {
        Kinesis
    } = require("@aws-sdk/client-kinesis");

// AWS.config.loadFromPath('./config.json');

const kinesis = new Kinesis();

const client = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const stream = client.stream('statuses/filter', { track: 'cat', language: 'en' });

// var stream = client.stream('statuses/filter', {
//     track: 'cat',
//     language: 'en'
// });

stream.on('tweet', function (event) {
    if (event.text) {
        var record = JSON.stringify({
            id: event.id,
            timestamp: event['created_at'],
            tweet: event.text.replace(/["'}{|]/g, '') //either strip out problem characters or base64 encode for safety 
        }) + '|'; // record delimiter

        kinesis.putRecord({
            Data: record,
            StreamName: 'twitterStream',
            PartitionKey: 'key'
        }, function (err, data) {
            if (err) {
                console.error(err);
            }
            console.log('sending: ', event.text);
        });
    }
});

stream.on('error', function (error) {
    throw error;
});