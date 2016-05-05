import sinon from 'sinon';
import proxyquire from 'proxyquire';
import Q from 'q';

describe('ApiClient', () => {

  let _fetch,
  _apiClient,
  _defaultContentTypeFilter,
  _jsonResponseFilter,
  _fetchDeferred,
  _request,
  _response;

  beforeEach(() => {

    function Request(url, options) {
      this.url = url;
      this.options = options;

      this.headers = {
        get: sinon.stub()
      }
    }

    _fetchDeferred = Q.defer();
    _fetch = sinon.stub().returns(_fetchDeferred.promise);

    _defaultContentTypeFilter = sinon.stub().returnsArg(0);
    _jsonResponseFilter = sinon.stub().returnsArg(0);

    _response = {
      ok: true,
      headers: {
        get: sinon.stub()
      },
      json: sinon.stub()
    };

    const ApiClient = proxyquire('../lib/ApiClient', {
      './defaultContentTypeFilter': {
        'default': _defaultContentTypeFilter,
        __esModule: true
      },
      './jsonResponseFilter': {
        'default': _jsonResponseFilter,
        __esModule: true
      },
      'node-fetch': {
        'default': _fetch,
        'Request': Request,
        '@noCallThru': true,
        __esModule: true
      }
    })
    .default;

    _apiClient = new ApiClient('http://te.st/');
  });

  describe('get method', () => {

    it('should add correct content type headers', () => {
      _apiClient.get('foo').done();
      _defaultContentTypeFilter.calledOnce.should.be.true;
    });

    it('should parse json responses', done => {
      _apiClient
      .get('foo')
      .then(() => {
        _jsonResponseFilter.calledOnce.should.be.true;
        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });

    it('should not parse non json responses', done => {
      _response
      .headers
      .get
      .withArgs('content-type')
      .returns('text/html');

      _apiClient
      .get('foo')
      .then(r => {
        r.should.equal(_response);
        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });

  });

  describe('post method', () => {
    it('should add correct content type headers', () => {
      _apiClient.post('foo', {}).done();
      _defaultContentTypeFilter.calledOnce.should.be.true;
    });

    it('should parse json responses', done => {
      _apiClient
      .post('foo', {})
      .then(r => {
        _jsonResponseFilter.calledOnce.should.be.true;
        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });

    it('should not parse non json responses', done => {
      _response
      .headers
      .get
      .withArgs('content-type')
      .returns('text/html');

      _apiClient
      .post('foo', {})
      .then(r => {
        r.should.equal(_response);
        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });

    it('should send serialized data to destination', done => {

      let data = {
        value: 100
      };

      _apiClient
      .post('foo', data)
      .then(() => {
        _fetch.calledWithMatch({
          options: { body: JSON.stringify(data) }
        })
        .should
        .be
        .true;

        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });
  });

  describe('put method', () => {

    it('should add correct content type headers', () => {
      _apiClient.put('foo', {}).done();
      _defaultContentTypeFilter.calledOnce.should.be.true;
    });

    it('should parse json responses', done => {
      _apiClient
      .put('foo', {})
      .then(r => {
        _jsonResponseFilter.calledOnce.should.be.true;
        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });

    it('should send serialized data to destination', done => {
      let data = {
        value: 100
      };

      _apiClient
      .put('foo', data)
      .then(() => {
        _fetch.calledWithMatch({
          options: { body: JSON.stringify(data) }
        })
        .should
        .be
        .true;
        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });
  });

  describe('delete method', () => {

    it('should add correct content type headers', () => {
      _apiClient.delete('foo').done();
      _defaultContentTypeFilter.calledOnce.should.be.true;
    });

    it('should parse json responses', (done) => {
      _apiClient.put('foo').then(r => {
        _jsonResponseFilter.calledOnce.should.be.true;
        done();
      })
      .done();

      _fetchDeferred.resolve(_response);
    });
  });
});
