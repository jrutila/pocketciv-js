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
      describe('area walker', function() {
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
          target.ok([2,4]).should.equal(false)
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
      describe('overall reducer', function() {
        beforeEach(function() {
          engine.map.areas = {
            5: { id: 5, 'tribes': 1, 'neighbours': [ 4 ] },
            4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 5 ] },
            3: { id: 3, 'tribes': 2, 'neighbours': [ 4 ] },
          }
          target = new reducer.Reducer(engine)
          target.mode = reducer.Modes.Overall
          target.startAmount = 4;
          target.areas = function() {
            return _.omit(engine.map.areas, _.map(this.visited, function(v) { return v.toString(); }))
          }
          target.reduce = function(r) {
            this.amount += r.tribes;
          }
        })
        it('should return changes', function() {
          target.ok({ 3: { 'tribes': -2 }, 4: { 'tribes': -2 } }).should.deep.equal({
            3: { 'tribes': '-2' },
            4: { 'tribes': '-2' },
          });
        })
        it('should give possible areas', function() {
          target.ok({}).areas.should.deep.equal(engine.map.areas)
          target.ok({ 3: { 'tribes': -1 } }).ok.should.equal(false);
          _.keys(target.ok({ 3: { 'tribes': -1 } }).areas).should.deep.equal([ '4', '5' ]);
        })
        it('should have remaining amount', function() {
          target.ok({}).amount.should.equal(4)
          target.ok({ 3: { 'tribes': -1 } }).amount.should.equal(3);
        })
        it('should return false if the reduction is bad', function() {
          target.ok({ 3: { 'tribes': -3 } }).should.equal(false);
        })
      });
    });
    describe('interactive mode', function() {
      describe('area walker', function() {
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
});

describe('Attack (worker)', function() {
  beforeEach(function() {
    target = new reducer.Reducer(engine);
    target.areas = reducer.Attack.areas;
    target.reduce = reducer.Attack.reduce;
  });
  describe('basic', function() {
    beforeEach(function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'city': 1, 'neighbours': [ 3 ] },
        3: { id: 3, 'tribes': 2, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 2, 'neighbours': [ 3 ] },
      }
    });
    it('should work in basic case', function() {
      target.startAmount = 9;
      target.startRegion = engine.map.areas[4];
      target.ok([3]).should.deep.equal({
        4: { 'tribes': '0', 'city': '0' },
        3: { 'tribes': '1' },
        'gold': '-2'
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
      target.ok([4, 3]).should.equal(false)
    });
    it('should not go to empty region', function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 2 ] },
        3: { id: 3, 'tribes': 0, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4 ] },
      }
      target.startAmount = 4;
      target.startRegion = engine.map.areas[4];
      _.keys(target.ok([]).areas).should.deep.equal(['2'])
      target.ok([3]).should.equal(false)
    });
    it('should be able to start from empty region', function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 2 ] },
        3: { id: 3, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4 ] },
      }
      target.startAmount = 3;
      target.startRegion = engine.map.areas[3];
      _.keys(target.ok([]).areas).should.deep.equal(['2'])
      _.keys(target.ok([2]).areas).should.deep.equal(['4'])
      target.ok([3]).should.equal(false)
      target.ok([2, 4]).should.deep.equal({
        4: { 'tribes': '1' },
        3: { },
        2: { 'tribes': '0' },
        
      })
    });
    describe('attack should go to the highest city in tribe tie', function() {
      beforeEach(function() {
        engine.map.areas = {
          5: { id: 5, 'tribes': 1, 'city': 5, 'neighbours': [ 4, 2 ] },
          4: { id: 4, 'tribes': 1, 'city': 3, 'neighbours': [ 2, 5 ] },
          3: { id: 3, 'tribes': 0, 'city': 4, 'neighbours': [ 2 ] },
          2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4, 5 ] },
        }
      })
      it('case 1', function() {
        target.startAmount = 33;
        target.startRegion = engine.map.areas[4];
        _.keys(target.ok([]).areas).should.deep.equal([ '5' ])
        _.keys(target.ok([5]).areas).should.deep.equal([ ])
        target.ok([5]).should.deep.equal({
          4: { 'city': '0', 'tribes': '0' },
          5: { 'tribes': '0', 'city': '2' },
          'gold': '-12',
        })
      })
      it('case 2', function() {
        target.startAmount = 27;
        target.startRegion = engine.map.areas[3];
        _.keys(target.ok([2]).areas).should.deep.equal([ '5' ])
        target.ok([2, 5]).should.deep.equal({
          3: { 'city': '0' },
          2: { 'tribes': '0' },
          5: { 'tribes': '0', 'city': '4' },
          'gold': '-10',
        })
        target.startAmount = 26;
        target.ok([2, 5]).should.deep.equal({
          3: { 'city': '0' },
          2: { 'tribes': '0' },
          5: { 'tribes': '0' },
          'gold': '-8',
        })
      })
    })
    describe('user should choose if there is a tie', function() {
      beforeEach(function() {
        engine.map.areas = {
          5: { id: 5, 'tribes': 1, 'city': 3, 'neighbours': [ 4, 2 ] },
          4: { id: 4, 'tribes': 1, 'city': 3, 'neighbours': [ 2, 5 ] },
          3: { id: 3, 'tribes': 0, 'city': 4, 'neighbours': [ 2 ] },
          2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4, 5 ] },
        }
      })
      it('case 1', function() {
        target.startAmount = 26;
        target.startRegion = engine.map.areas[3];
        _.keys(target.ok([2]).areas).should.deep.equal([ '4', '5' ])
        target.ok([2, 5]).should.deep.equal({
          3: { 'city': '0' },
          2: { 'tribes': '0' },
          5: { 'tribes': '0' },
          'gold': '-8',
        })
        target.ok([2, 4]).should.deep.equal({
          3: { 'city': '0' },
          2: { 'tribes': '0' },
          4: { 'tribes': '0' },
          'gold': '-8',
        })
      })
    })
    describe('attack should stop', function() {
      beforeEach(function() {
        engine.map.areas = {
          5: { id: 5, 'tribes': 5, 'neighbours': [ 4 ] },
          4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 5 ] },
          3: { id: 3, 'tribes': 0, 'neighbours': [ 4, 2 ] },
          2: { id: 2, 'tribes': 1, 'neighbours': [ 3 ] },
        }
      })
      it('case 1', function() {
        target.startAmount = 4;
        target.startRegion = engine.map.areas[2];
        target.ok([3, 4]).should.equal(false)
        _.keys(target.ok([]).areas).should.deep.equal([ ])
        target.ok([4, 3]).should.equal(false)
      })
      it('case 2', function() {
        target.startAmount = 8;
        target.startRegion = engine.map.areas[4];
        _.keys(target.ok([]).areas).should.deep.equal([ '5' ])
        target.ok([5]).should.deep.equal({
          4: { 'tribes': '0' },
          5: { 'tribes': '0' },
        });
        target.ok([2]).should.equal(false)
      })
      it('case 3', function() {
        target.startAmount = 9;
        target.startRegion = engine.map.areas[5];
        _.keys(target.ok([]).areas).should.deep.equal([ '4' ])
        target.ok([4]).should.deep.equal({
          4: { 'tribes': '0' },
          5: { 'tribes': '0' },
        });
        target.ok([2]).should.equal(false)
        target.ok([3]).should.equal(false)
        target.ok([5]).should.equal(false)
      })
      it('case 4', function() {
        engine.map.areas = { //require("../app/scenarios/scenario1").map.areas;
          2: { id: 2, 'neighbours': [ 3,8,5 ] },
          3: { id: 3, 'neighbours': [ 1,2,8 ] },
          8: { id: 8, 'tribes': 2, 'neighbours': [ 1,2,3,7 ] },
          5: { id: 5, 'tribes': 0, 'neighbours': [ 2,7 ] },
          7: { id: 7, 'tribes': 1, 'neighbours': [ 5,8 ] },
          1: { id: 1, 'tribes': 1, 'neighbours': [ 3,8 ] },
        }
        target.startAmount = 8;
        target.startRegion = engine.map.areas[2];
        _.keys(target.ok([]).areas).should.deep.equal([ '8' ])
        target.ok([8, 7]).should.deep.equal({
          2: { },
          8: { 'tribes': '0' },
          7: { 'tribes': '0' },
        });
    });
    });
  });
});
