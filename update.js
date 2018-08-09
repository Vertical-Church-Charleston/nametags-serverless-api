import AWS from "aws-sdk";
import { success, failure } from "./libs/response-lib";
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const TagDeserializer = new JSONAPIDeserializer({
  keyForAttribute: 'camelCase'
});
AWS.config.update({ region: "us-east-1" });

export function main(event, context, callback) {
  const data = JSON.parse(event.body);
  TagDeserializer.deserialize(data, function (error,tag){
    if(error){
      callback(null, failure({ status: false, error }));
    } else {
      try {
        const S3 = new AWS.S3();
        const getParams = {
          Bucket: 'nametags-database', 
          Key: `record-${event.pathParameters.id}.json`
        };
        S3.getObject(getParams, function (error, data){
          if (error) {
            console.log(error);
            callback(null, failure({ status: false, error }));
          } else {
            let object = JSON.parse(data.Body);
            object.firstName = tag.firstName;
            object.lastName = tag.lastName;
            const updateParams = {
              Bucket: 'nametags-database', 
              Key: `record-${event.pathParameters.id}.json`,
              Body: JSON.stringify(object)
            };
            S3.putObject(updateParams, function (error){
              if (error) {
                console.log(error);
                callback(null, failure({ status: false, error }));
              } else {
                callback(null, success(object));
                const getList = {
                  Bucket: 'nametags-database', 
                  Key: `list.json`
                };
                S3.getObject(getList, function (error, data){
                  if (error) {
                    console.log(error);
                  } else {
                    let list = JSON.parse(data.Body);
                    list = list.map((obj) => {
                      if (obj.id === event.pathParameters.id) {
                        obj.firstName = tag.firstName;
                        obj.lastName = tag.lastName;
                      }
                      return obj;
                    })
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
          }
        });
      } catch (e) {
        console.log(e)
        callback(null, failure({ status: false }));
      }
    }
  });
}
