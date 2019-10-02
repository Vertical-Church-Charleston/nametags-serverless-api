const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const TagSerializer = new JSONAPISerializer('tags', {
  attributes: ['firstName', 'lastName','__id__'],
  keyForAttribute: 'camelCase',
});

export function success(response, isPrint) {
  return buildResponse(response, isPrint);
}

export function failure(response) {
  return buildResponse({...response, statusCode: 500});
}

function buildResponse(response, isPrint) {
  const defaultResponse = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
  };
  let newResponse = {
    ...defaultResponse,
    ...response
  }
  let body;
  if (!isPrint) {
    newResponse.body = JSON.stringify(TagSerializer.serialize(response.body))
  }
  return newResponse;
}
