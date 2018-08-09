const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const TagSerializer = new JSONAPISerializer('tags', {
  attributes: ['firstName', 'lastName','__id__'],
  keyForAttribute: 'camelCase',
});

export function success(body) {
  if (body.hasOwnProperty('status') && body.status !== 200) {
    return buildResponse(body.status);
  } else {
    return buildResponse(200, TagSerializer.serialize(body));
  }
}

export function failure(body) {
  return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}
