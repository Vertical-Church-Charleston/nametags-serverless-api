import AWS from "aws-sdk";
import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { isEmpty } from 'lodash';
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const TagDeserializer = new JSONAPIDeserializer({
  keyForAttribute: 'camelCase'
});
AWS.config.update({ region: "us-east-1" });

export function main(event, context, callback) {
  try {
    const data = JSON.parse(event.body);
    TagDeserializer.deserialize(data, (error,tag)=>{
      if(error){
        console.log(error);
        callback(null, failure({ status: false, error }));
      } else {
        const S3 = new AWS.S3();
        const props = {
          id: uuid.v1(),
          firstName: tag.firstName,
          lastName: tag.lastName,
          createdAt: Date.now()
        }
        const params = {
          Body: JSON.stringify(props), 
          Bucket: process.env.S3DBBucketName, 
          Key: `record-${props.id}.json`
        };
        S3.putObject(params, function(error) {
          if (error) {
            console.log(error);
            callback(null, failure({ status: false, error }));
          } else {
            callback(null, success(props));
          }
        });
        const getParams = {
          Bucket: process.env.S3DBBucketName, 
          Key: `list.json`
        };
        S3.getObject(getParams, function(error, data) {
          if (error) {
            console.log(error);
          } else {
            let list = JSON.parse(data.Body);
            list.push(props);
            const listParams = {
              Body: JSON.stringify(list), 
              Bucket: process.env.S3DBBucketName, 
              Key: `list.json`
            }
            S3.putObject(listParams, function(error) {
              if (error) {
                console.log(error);
              }
            });
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}