import AWS from "aws-sdk";
import { success, failure } from "./libs/response-lib";
AWS.config.update({ region: "us-east-1" });

export function main(event, context, callback) {
  try {
    const S3 = new AWS.S3();
    const params = {
      Bucket: 'nametags-database', 
      Key: `record-${event.pathParameters.id}.json`
    };
    S3.getObject(params, function(error, data) {
      if (error) {
        console.log(error);
        callback(null, failure({ status: false, error }));
      } else {
        console.log(data);
        callback(null, success({body: JSON.parse(data.Body)}));
      }
    });
  } catch (e) {;
    console.log(e);
    callback(null, failure({ status: false, error: e }));
  }
}
