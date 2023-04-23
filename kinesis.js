async function asyncCall() {

var {TwitterApi} = require('twitter-api-v2');

var AWS = require('aws-sdk'),
    {
        Kinesis
    } = require("@aws-sdk/client-kinesis");

AWS.config.loadFromPath('./config.json');

var kinesis = new Kinesis();

var client = new TwitterApi({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

const rules = await client.v2.streamRules();

// Add rules
const addedRules = await client.v2.updateStreamRules({
    add: [
      { value: 'cat', tag: 'cat' }
    ],
  });

// Log every rule ID
console.log(rules.data.map(rule => rule.id));

// var stream = await client.v1.filterStream({
//     track: 'cat',
//     language: 'en'
// });

// stream.on('data', function (event) {
//     if (event.text) {
//         var record = JSON.stringify({
//             id: event.id,
//             timestamp: event['created_at'],
//             tweet: event.text.replace(/["'}{|]/g, '') //either strip out problem characters or base64 encode for safety 
//         }) + '|'; // record delimiter

//         kinesis.putRecord({
//             Data: record,
//             StreamName: 'twitterStream',
//             PartitionKey: 'key'
//         }, function (err, data) {
//             if (err) {
//                 console.error(err);
//             }
//             console.log('sending: ', event.text);
//         });
//     }
// });

stream.on(
    // Emitted when Node.js {response} emits a 'error' event (contains its payload).
    ETwitterStreamEvent.ConnectionError,
    err => console.log('Connection error!', err),
  );
  
  stream.on(
    // Emitted when Node.js {response} is closed by remote or using .close().
    ETwitterStreamEvent.ConnectionClosed,
    () => console.log('Connection has been closed.'),
  );
  
  stream.on(
    // Emitted when a Twitter payload (a tweet or not, given the endpoint).
    ETwitterStreamEvent.Data,
    eventData => console.log('Twitter has sent something:', eventData),
  );
  
  stream.on(
    // Emitted when a Twitter sent a signal to maintain connection active
    ETwitterStreamEvent.DataKeepAlive,
    () => console.log('Twitter has a keep-alive packet.'),
  );
  
  // Enable reconnect feature
  stream.autoReconnect = true;
  
  // Be sure to close the stream where you don't want to consume data anymore from it
  stream.close();

}
asyncCall();
