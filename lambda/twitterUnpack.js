const {
          DynamoDBDocument
      } = require("@aws-sdk/lib-dynamodb"),
      {
          DynamoDB
      } = require("@aws-sdk/client-dynamodb"),
      {
          S3
      } = require("@aws-sdk/client-s3");
const s3 = new S3();
const docClient = DynamoDBDocument.from(new DynamoDB());

exports.handler = (event, context, callback) => {

    //Build the S3 Params string.  Watch out here because we're assuming only 1 record per trigger
    let s3Params = {
        Bucket: event.Records[0].s3.bucket.name,
        Key: event.Records[0].s3.object.key
    };

    //Build the dynamoDB connect string using environment variable
    let dynParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {}
    };

    s3.getObject(s3Params, function(err, data) {
        if (err) {
            callback(err);
        }
        else {
            let dynamoData = data.Body.toString().split('|');

            dynamoData.pop(); //get rid of the last entry of the array because its empty

            dynamoData.forEach(function(row) {
                dynParams.Item = JSON.parse(row);
                docClient.put(dynParams, function(err, data) {
                    if (err) callback(err);
                    else callback(null, data);
                });

            });
        }
    });

};