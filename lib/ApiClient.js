import Q from 'q';
import fetch, {Request} from 'node-fetch';

import defaultContentTypeFilter from './defaultContentTypeFilter';
import jsonResponseFilter from './jsonResponseFilter';

function canonicalUrl(client, url) {
  if (!client) {
    throw new Error('client could not be null');
  }

  if (!url) {
    throw new Error('url could not be null');
  }

  let [f] = url;
  return (f === '/') ? client.baseUrl + url : client.baseUrl + '/' + url;
}

function invokeJson(client, url, options, method, data) {
  if (!client) {
    throw new Error('client could not be null');
  }

  if (!url) {
    throw new Error('url could not be null');
  }

  if (!method) {
    throw new Error('method could not be null');
  }

  options = options || {};
  options.type = 'json';

  var requestOptions = {
    method: method
  };

  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  let canonUrl = canonicalUrl(client, url);
  let request = new Request(canonUrl, requestOptions);
  return invoke(client, request, options);
}

function invoke(client, request, options) {
  if (!client) {
    throw new Error('client could not be null');
  }

  if (!request) {
    throw new Error('request could not be null');
  }

  var filteredRequest = client.requestFilter(request, options);
  if (!filteredRequest) {
    throw new Error('Request filter did not return a valid request');
  }

  const deferred = Q.defer();

  fetch(request).then(res => {
    if (res.ok) {
      var response = client.responseFilter(res, request, options);
      if (response) {
        deferred.resolve(response);
      } else {
        deferred.reject(new Error('Response filter did not return a valid response'));
      }
    } else {
      const handled = client.exceptionFilter(res, request, options);
      if (handled) {
        deferred.resolve(handled);
      } else {
        deferred.reject(res);
      }
    }
  })
  .catch(e => {
    const v = client.exceptionFilter(e, request, options);
    if (v) {
      deferred.resolve(v);
    } else {
      deferred.reject(e);
    }
  });

  return deferred.promise;
}

export default class ApiClient {

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.requestFilter = r => r;
    this.addRequestFilter(defaultContentTypeFilter);

    this.responseFilter = r => r;
    this.addResponseFilter(jsonResponseFilter);

    this.exceptionFilter = () => false;
  }

  addRequestFilter(filter) {
    const current = this.requestFilter;
    this.requestFilter = (r, o) => {
      return current(filter(r, o), o);
    };
  }

  addResponseFilter(filter) {
    const current = this.responseFilter;
    this.responseFilter = (res, req, o) => {
      return current(filter(res, req, o));
    };
  }

  addExceptionFilter(filter) {
    const current = this.exceptionFilter;
    this.exceptionFilter = (ex, req, o) => {
      var result = filter(ex, req, o);

      if (!result) {
        result = current(ex, req, o);
      }

      return result;
    };
  }

  get(url, options) {
    return invokeJson(this, url, options, 'get');
  }

  post(url, data, options) {
    return invokeJson(this, url, options, 'post', data);
  }

  put(url, data, options) {
    return invokeJson(this, url, options, 'put', data);
  }

  delete(url, options) {
    return invokeJson(this, url, options, 'delete');
  }
}
