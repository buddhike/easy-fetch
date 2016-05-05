const defaultContent = 'application/json';

export default function (request, options) {
  if (options.type !== 'json') {
    return request;
  }

  request.headers.set('Content-Type', defaultContent);
  request.headers.set('Accept', defaultContent);

  return request;
}
