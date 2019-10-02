import AWS from "aws-sdk";
import { success, failure } from "./libs/response-lib";
import { remove } from 'lodash';
AWS.config.update({ region: "us-east-1" });

export function main(event, context, callback) {
  try {
    const S3 = new AWS.S3();
    const deleteParams = {
      Bucket: 'nametags-database', 
      Key: `record-${event.pathParameters.id}.json`
    };
    S3.deleteObject(deleteParams, function(error) {
      if (error) {
        console.log(error);
        callback(null, failure({ status: false, error }));
      } else {
        callback(null, success({ statusCode: 204 }));
        const getParams = {
          Bucket: 'nametags-database', 
          Key: `list.json`
        };
        S3.getObject(getParams, function(error, data) {
          if (error) {
            console.log(error);
          } else {
            let list = JSON.parse(data.Body);
            remove(list, n => n.id === event.pathParameters.id);
            const listParams = {
              Body: JSON.stringify(list), 
              Bucket: 'nametags-database', 
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
    console.log(e)
    callback(null, failure({ status: false }));
  }
}
