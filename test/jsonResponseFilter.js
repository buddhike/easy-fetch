import sinon from 'sinon';

import jsonResponseFilter from '../lib/jsonResponseFilter';

describe('jsonResponseFilter', () => {

  let _parsedResponse, _getHeaders, _response;

  beforeEach(() => {
    _parsedResponse = {};
    _getHeaders = sinon.stub();

    _response = {
      json: sinon.stub().returns(_parsedResponse),
      headers: {
        get: _getHeaders
      }
    };

  });

  describe('json responses', () => {

    beforeEach(() => {
      _getHeaders.withArgs('content-type').returns('application/json');
    });

    it('should returned the parsed response', () => {
      const result = jsonResponseFilter(_response);
      result.should.equal(_parsedResponse);
    });

  });

  describe('non json responses', () => {

    beforeEach(() => {
      _getHeaders.withArgs('content-type').returns('text/html');
    });

    it('should return the unmodified response', () => {
      const result = jsonResponseFilter(_response);
      result.should.equal(_response);
    });

  });

});
