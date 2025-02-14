const {
        Comprehend
      } = require("@aws-sdk/client-comprehend"),
      {
        DynamoDBDocument
      } = require("@aws-sdk/lib-dynamodb"),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");
const docClient = DynamoDBDocument.from(new DynamoDB());
const comprehend = new Comprehend();

exports.handler = (event, context, callback) => {

  event.Records.forEach(function(record) {

    if (record.eventName == 'INSERT') { // only run for Insert events

      let comprehendParams = {
        LanguageCode: 'en',
        Text: record.dynamodb.NewImage.tweet.S
      };

      comprehend.detectSentiment(comprehendParams, function(err, data) {
        if (err) callback(err); // something strange happened
        else {

          let dynParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
              "sentiment": data.Sentiment
            },
            UpdateExpression: "ADD tweets :val",
            ConditionExpression: "attribute_not_exists(sentiment) OR sentiment = :sentiment",
            ExpressionAttributeValues: {
              ":val": 1,
              ":sentiment": data.Sentiment
            },
            ReturnValues: "UPDATED_NEW"
          };

          docClient.update(dynParams, function(err, data) {
            if (err) {
              callback(err); // something strange happened
            }
            else {
              callback(null, data);
            }
          });
        }
      });
    }
  });
};
