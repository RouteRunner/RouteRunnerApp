var assert = require('assert');

var fakeArray = [];

describe('My fake array object', function() {
  describe('The pop method', function() {

    before(function() {
      fakeArray[0] = 1;
      fakeArray[1] = 2;
      fakeArray[2] = 3;
      fakeArray.length = 3;
    });

    it('should return the final element', function() {
      assert.equal(fakeArray.pop(), 3);
    });
  });
});

describe('Set Origin Button', function(){
  it('should bring up modal', function(){
    expect.
  })
})
