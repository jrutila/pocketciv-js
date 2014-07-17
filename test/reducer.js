var should = require('chai').should()
var pocketciv = require('../core/pocketciv')
var reducer = require('../core/reducer')
var event = require('../core/event')

var engine = pocketciv.Engine

describe('Reducer', function() {
  describe('basic', function() {
    it('should have original_amoount', function() {
      var target = new reducer.Reducer(engine);
      target.startAmount = 10;
      target.amount.should.equal(target.startAmount)
    });
    it('should let user choose start region', function(done) {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3 ] },
        3: { id: 3, 'tribes': 2, 'neighbours': [ 4 ] },
      }
      var areaQ = [4, 3]
      engine.selector = function(areas, done) {
        done(areas[areaQ.shift()]);
      }
      var target = new reducer.Reducer(engine);
      target.reduce = function(area) {
        return { 'tribes': '-1' }
      };
      target.areas = function() {
        return engine.map.areas;
      };
      target.start(function(chgs) {
        chgs.should.deep.equal(
          { 4: { 'tribes': '-1' },
           3: { 'tribes': '-1' }}
        );
        done();
      });
    });
    it('should stop when amount is used', function(done) {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3 ] },
        3: { id: 3, 'tribes': 2, 'neighbours': [ 4 ] },
      }
      var areaQ = [4, 3]
      engine.selector = function(areas, done) {
        done(areas[areaQ.shift()]);
      }
      var target = new reducer.Reducer(engine);
      target.startAmount = 4;
      target.reduce = function(area) {
        var rTrb = Math.min(area.tribes, this.amount);
        this.amount -= rTrb;
        return { 'tribes': (area.tribes - rTrb).toString() }
      };
      target.areas = function() {
        return engine.map.areas;
      };
      target.start(function(chgs) {
        chgs.should.deep.equal(
          { 4: { 'tribes': '0' },
           3: { 'tribes': '1' }}
        );
        done();
      });
    });
  });
});
