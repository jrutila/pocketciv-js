var should = require('chai').should()
var pocketciv = require('../core/pocketciv')
var reducer = require('../core/reducer')
var event = require('../core/event')
var _ = require('underscore')

var engine = pocketciv.Engine

describe('Reducer', function() {
  describe('basic', function() {
    it('should have original_amoount', function() {
      var target = new reducer.Reducer(engine);
      target.startAmount = 10;
      target.amount.should.equal(target.startAmount)
    });
    it('should have start region', function() {
      var target = new reducer.Reducer(engine);
      target.startRegion = { id: 5 };
      target.currentArea.should.equal(target.startRegion)
    });
    describe('worker mode', function() {
        beforeEach(function() {
          engine.map.areas = {
            4: { id: 4, 'tribes': 3, 'neighbours': [ 3 ] },
            3: { id: 3, 'tribes': 2, 'neighbours': [ 4,2  ] },
            2: { id: 2, 'tribes': 2, 'neighbours': [ 3 ] },
          }
          target = new reducer.Reducer(engine);
          target.startAmount = 4;
          target.reduce = function(area) {
            var rTrb = Math.min(area.tribes, this.amount);
            this.amount -= rTrb;
            return { 'tribes': (area.tribes - rTrb).toString() }
          };
          target.areas = function() {
            var areas = {}
            _.each(this.engine.map.areas, function(area, key) {
              if (!this.currentArea || this.currentArea.neighbours.indexOf(parseInt(key)) > -1)
                areas[key] = area;
            }, this);
            return areas;
          };
        }),
        it('should tell if the given regions are ok', function() {
          target.ok([4, 3]).should.deep.equal({
            4: { 'tribes': '0' },
            3: { 'tribes': '1' }
          })
        });
        it('should return false if amount is above zero', function() {
          target.ok([2]).ok.should.equal(false);
        });
        it('should return false if the phase is not applicable', function() {
          target.ok([2,4]).ok.should.equal(false)
        });
        it('should return possible areas if no start', function() {
          target.ok([]).should.deep.equal({
            'ok': false,
            'amount': 4,
            'areas': engine.map.areas,
          });
        });
        it('should return possible areas if a start', function() {
          target.startRegion = engine.map.areas[2];
          var areas = { '3': engine.map.areas[3] }
          target.ok([]).should.deep.equal({
            'ok': false,
            'amount': 2,
            'areas': areas,
          });
          target.ok([3]).should.deep.equal({
            2: { 'tribes': '0' },
            3: { 'tribes': '0' }
          });
        });
    });
    describe('interactive mode', function() {
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
          target.startAmount = 10;
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
            2: { id: 2, 'tribes': 2, 'neighbours': [ 3 ] },
          }
          var areaQ = [4, 3, 2]
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
});

describe.only('Attack (worker)', function() {
  beforeEach(function() {
    target = new reducer.Reducer(engine);
    target.areas = reducer.Attack.areas;
    target.reduce = reducer.Attack.reduce;
  });
  describe('basic', function() {
    beforeEach(function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3 ] },
        3: { id: 3, 'tribes': 2, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 2, 'neighbours': [ 3 ] },
      }
    });
    it('should work in basic case', function() {
      target.startAmount = 4;
      target.startRegion = engine.map.areas[4];
      target.ok([3]).should.deep.equal({
        4: { 'tribes': '0' },
        3: { 'tribes': '1' },
      });
    });
  });
  describe('automatic movement', function() {
    it('attack should go to lowest tribe', function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 2 ] },
        3: { id: 3, 'tribes': 2, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4 ] },
      }
      target.startAmount = 4;
      target.startRegion = engine.map.areas[4];
      target.ok([2]).should.deep.equal({
        4: { 'tribes': '0' },
        2: { 'tribes': '0' },
      });
      target.startAmount = 4;
      target.startRegion = engine.map.areas[2];
      target.ok([3, 4]).should.deep.equal({
        4: { 'tribes': '2' },
        3: { 'tribes': '0' },
        2: { 'tribes': '0' },
      });
      target.ok([]).ok.should.equal(false)
      _.keys(target.ok([]).areas).should.deep.equal([ '3' ])
      _.keys(target.ok([3]).areas).should.deep.equal([ '4' ])
      target.ok([4, 3]).ok.should.equal(false)
    });
    it('attack should stop', function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3 ] },
        3: { id: 3, 'tribes': 0, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 1, 'neighbours': [ 3 ] },
      }
      target.startAmount = 4;
      target.startRegion = engine.map.areas[4];
      target.ok([2]).ok.should.equal(false)
      target.ok([]).should.deep.equal({
        4: { 'tribes': '0' },
      });
      target.startAmount = 4;
      target.startRegion = engine.map.areas[2];
      target.ok([3, 4]).should.deep.equal({
        4: { 'tribes': '2' },
        3: { 'tribes': '0' },
        2: { 'tribes': '0' },
      });
      _.keys(target.ok([]).areas).should.deep.equal([ '3' ])
      _.keys(target.ok([3]).areas).should.deep.equal([ '4' ])
      target.ok([4, 3]).ok.should.equal(false)
    });
  });
});
