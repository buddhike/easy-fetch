import sinon from 'sinon';

import defaultContentTypeFilter from '../lib/defaultContentTypeFilter';

describe('defaultContentTypeFilter', () => {
  describe('non json requests', () => {
    it('should send the request unmodified', () => {
        const request = {};
        var result = defaultContentTypeFilter(request, {});
        result.should.equal(request);
    });
  });

  describe('json requests', () => {
    let setHeader, request, options;

    beforeEach(() => {
      setHeader = sinon.stub();

      request = {
        headers: {
          set: setHeader
        }
      };

      options = { type: 'json' };
    });

    it('should add content-type header', () => {
      defaultContentTypeFilter(request, options);
      setHeader.calledWith('Content-Type', 'application/json').should.be.true;
    });

    it('should add accept header', () => {
      defaultContentTypeFilter(request, options);
      setHeader.calledWith('Accept', 'application/json').should.be.true;
    });
    
  });
});
