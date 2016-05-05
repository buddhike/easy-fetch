const defaultContent = 'application/json';

export default function (response) {
  let contentType = response.headers.get('content-type').toLowerCase();
  if (contentType && contentType.indexOf(defaultContent) > -1) {
    return response.json();
  }
  return response;
}
