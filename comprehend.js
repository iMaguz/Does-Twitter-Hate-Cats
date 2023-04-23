var AWS = require('aws-sdk'),
    {
       Comprehend
    } = require("@aws-sdk/client-comprehend");
 
AWS.config.loadFromPath('./config.json');

var comprehend = new Comprehend();

var params = {
    LanguageCode: 'en',
    Text : process.argv[2]
};

comprehend.detectSentiment(params, function(err,data){
   if(err) console.log(err)
   else console.log(data);
});

