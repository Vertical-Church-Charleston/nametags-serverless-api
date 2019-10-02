import AWS from "aws-sdk";
import fs from "fs";
import { success, failure } from "./libs/response-lib";
import Handlebars from "handlebars";
var pdf = require('html-pdf');
var Api2Pdf = require('api2pdf');   
AWS.config.update({ region: "us-east-1" });

const api2pdfkey = "5c983cc9-97c4-4d7b-8003-d7a75ca525ad"
var a2pClient = new Api2Pdf(api2pdfkey);

// const pdfOptions = { format: 'Letter', phantomPath: './phantomjs_lambda/phantomjs_linux-x86_64' };
// const S3config = { bucketName: 'name-tag-studio-server' }; //Change to your bucket name

export function main(event, context, callback) {
  try {
    const ids = event.queryStringParameters.ids.split(",");
    const S3 = new AWS.S3();
    const params = {
      Bucket: "nametags-database",
      Key: `list.json`
    };
    S3.getObject(params, function(error, data) {
      if (error) {
        console.log(error);
        callback(null, failure({ statusCode: 500, error }));
      } else {
        console.log(ids);
        const tags = JSON.parse(data.Body).filter(t => ids.indexOf(t.id) > -1);
        console.log(tags);
        fs.readFile(`views/printtags.hbs`, (err, resp) => {
          if (err) {
            callback(null, failure({ statusCode: 500, err }));
            return;
          }
          const source = resp.toString();
          const template = Handlebars.compile(source);
          console.log(template);
          const html = template({ tags: tags });
          console.log(html);
          const pdfOptions = { pageSize: 'Letter', marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0, printMediaType: true, zoom: 1.25 };
          const date = new Date();
          const fileName = `name-tags-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.pdf`;
          a2pClient.wkhtmltopdfFromHtml(html, false, fileName, pdfOptions).then(function(result) {
            console.log(result)
            let response = {
              statusCode: 200,
              body: result.pdf
            };
            console.log(response)
            callback(null, success({body: response}, true));
          });
          // pdf.create(html, {}).toBuffer(function(err, buffer) {
          //   if (err) return console.log(err);
          //   // console.log(buffer);
          //   let response = {
          //     statusCode: 200,
          //     headers: {
          //       'Content-type' : 'application/pdf',
          //       "Access-Control-Allow-Origin": "*",
          //       "Access-Control-Allow-Credentials": true
          //     },
          //     body: buffer.toString('base64'),
          //     isBase64Encoded : true,
          //   };
          //   callback(null, success({body: response}));
          // });
        });
      }
    });
  } catch (e) {
    console.log(e);
    callback(null, failure({ statusCode: 500, error: e }));
  }
}
