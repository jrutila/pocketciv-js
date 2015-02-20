var should = require('chai').should()
var pocketciv = require('../src/core/pocketciv')
var reducer = require('../src/core/reducer')
var event = require('../src/core/event')
var _ = require('underscore')
var CityAdvance = require('../src/phases/city_advance').CityAdvance;

var engine = pocketciv.Engine

describe('Reducer', function() {
  describe.only('usage', function() {
    it('selector style', function() {
      var opts = {
        amount: 10,
        name: "test_reducer",
        map: {
          1: { neighbours: [2] },
          2: { neighbours: [1,3] },
          3: { neighbours: [2] },
        },
        initial: {
          1: { 'tribes': 4 },
          2: { 'tribes': 4 },
          3: { 'tribes': 4 },
        },
        reduce: function(key, chg) {
          // ignore chg
          var val = Math.min(this.initial[key].tribes, this.amount);
          this.amount -= val;
          return { 'tribes': this.initial[key].tribes - val };
        },
      }
      var target = new reducer.Reducer(opts);
      
      var ok = target.ok({});
      ok.changes.should.deep.equal({});
      ok.current.should.deep.equal(target.initial);
      ok.ok.should.be.false;
      ok.amount.should.equal(opts.amount);
      
      //ok = target.ok({ 1: null })
      ok = target.ok([ 1 ])
      ok.current.should.deep.equal(_.omit(opts.initial, '1'));
      ok.changes.should.deep.equal({ 1: { 'tribes': (-1*opts.initial[1].tribes).toString() }});
      ok.ok.should.be.false;
      ok.amount.should.equal(opts.amount - 4);
      
      //ok = target.ok({ 1: null, 2: null })
      ok = target.ok([ 1, 2 ])
      ok.current.should.deep.equal(_.omit(opts.initial, '1', '2'));
      ok.changes.should.deep.equal(
        { 1: { 'tribes': (-1*opts.initial[1].tribes).toString() },
          2: { 'tribes': (-1*opts.initial[2].tribes).toString() }}
        );
      ok.ok.should.be.false;
      ok.amount.should.equal(opts.amount - 4*2);
      
      ok = target.ok([ 1, 2, 3 ])
      ok.current.should.deep.equal({});
      ok.changes.should.deep.equal(
        { 1: { 'tribes': (-1*opts.initial[1].tribes).toString() },
          2: { 'tribes': (-1*opts.initial[2].tribes).toString() },
          3: { 'tribes': '-2' }}
        );
      ok.amount.should.equal(0);
      ok.ok.should.be.true;
    });
    it('overall reducer style', function() {
      var opts = {
        amount: 0,
        name: "test_reducer",
        map: {
          1: { neighbours: [2] },
          2: { neighbours: [1,3] },
          3: { neighbours: [2] },
        },
        initial: {
          1: { 'tribes': 5, 'city': 2 },
          2: { 'tribes': 5 },
          3: { 'tribes': 5, 'city': 1 },
        },
        // Increase city at cost of three and only two of them separetely
        reduce: function(key, chg) {
          var dcity = chg.city - (this.initial[key].city || 0);
          return { 'tribes': 0 };
        },
      }
      var target = new reducer.Reducer(opts);
      
      var ok = target.ok({});
      ok.changes.should.deep.equal({});
      ok.current.should.deep.equal(target.initial);
      ok.ok.should.be.true;
      ok.amount.should.equal(opts.amount);
      
      ok = target.ok({ 1: { 'city': 3 }})
      ok.current.should.deep.equal();
      ok.changes.should.deep.equal({ 1: { 'tribes': (-1*opts.initial[1].tribes).toString() }});
      ok.ok.should.be.false;
      ok.amount.should.equal(opts.amount - 4);
    });
    
  });
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
          target.ok([4, 3]).changes.should.deep.equal({
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
            'changes': {},
            'areas': engine.map.areas,
          });
        });
        it('should return possible areas if a start', function() {
          target.startRegion = engine.map.areas[2];
          var areas = { '3': engine.map.areas[3] }
          target.ok([]).should.deep.equal({
            'ok': false,
            'amount': 2,
            'changes': { 2: {'tribes': '0' }},
            'areas': areas,
          });
          target.ok([3]).changes.should.deep.equal({
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
          target.ok({ 3: { 'tribes': -2 }, 4: { 'tribes': -2 } }).changes.should.deep.equal({
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
      describe('selector reducer', function() {
        beforeEach(function() {
          target = new reducer.Reducer(engine)
          target.mode = reducer.Modes.Overall;
          target.startAmount = 0;
          target.areas = function() {
            var areas = {};
            _.each(engine.map.areas, function(a) {
              if (a.city && a.tribes)
              {
                var chg = this.changes[a.id] || {};
                var t = chg.tribes ? eval(a.tribes+chg.tribes) : a.tribes;
                var c = chg.city ? eval(a.city+chg.city) : a.city;
                if (t >= c+1)
                  areas[a.id] = a;
              }
            }, this)
            return areas;
          }
          target.reduce = function(r, area) {
            if (r.city == 0 && r.tribes == 0) return;
            var c = area.city;
            var t = area.tribes;
            while (c < area.city + r.city)
            {
              // If there is not enough tribes
              c++;
              if (t - c < 0) return false;
              t -= c;
            }
            return { 'city': '+'+(c - area.city), 'tribes': (t - area.tribes).toString() }
          }
        })
        it('should return possible areas', function() {
          engine.map.areas = {
            5: { id: 5,'city': 1, 'tribes': 1, 'neighbours': [ 4 ] },
            4: { id: 4,'city': 1, 'tribes': 3, 'neighbours': [ 3, 5 ] },
            3: { id: 3, 'tribes': 2, 'neighbours': [ 4 ] },
          }
          target.ok({}).ok.should.be.true;
          _.keys(target.ok({}).areas).should.deep.equal([ "4" ]);
          target.ok({ 4: { "city": 1 }}).changes.should.deep.equal({
            4: { 'city': '+1', 'tribes': '-2' }
          });
          target.ok({ 4: { "city": 4 }}).should.be.false;
        })
        it('should return possible areas even one area is used', function() {
          engine.map.areas = {
            5: { id: 5,'city': 1, 'tribes': 2, 'neighbours': [ 4 ] },
            4: { id: 4,'city': 1, 'tribes': 7, 'neighbours': [ 3, 5 ] },
            3: { id: 3, 'tribes': 2, 'neighbours': [ 4 ] },
          }
          target.ok({}).ok.should.be.true;
          _.keys(target.ok({}).areas).should.deep.equal([ "4", "5" ]);
          target.ok({ 4: { "city": 1 }}).changes.should.deep.equal({
            4: { 'city': '+1', 'tribes': '-2' }
          });
          _.keys(target.ok({ 4: { "city": 1 }}).areas).should.deep.equal([ "4", "5" ]);
          _.keys(target.ok({ 4: { "city": 2 }}).areas).should.deep.equal([ "5" ]);
          target.ok({ 4: { "city": 4 }}).should.be.false;
        })
        it('should ignore zeroes', function() {
          engine.map.areas = {
            5: { id: 5,'city': 1, 'tribes': 2, 'neighbours': [ 4 ] },
            4: { id: 4,'city': 1, 'tribes': 7, 'neighbours': [ 3, 5 ] },
            3: { id: 3, 'tribes': 2, 'neighbours': [ 4 ] },
          }
          target.ok({}).changes.should.deep.equal({})
          target.ok({}).ok.should.be.true;
          target.ok({ 5: { 'city': 0, 'tribes': 0 }}).changes.should.deep.equal({})
          target.ok({ 5: { 'city': 0, 'tribes': 0 }}).ok.should.be.true;
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


describe('City Advance (worker)', function() {
  beforeEach(function() {
    target = new reducer.Reducer(engine);
    target.areas = CityAdvance.areas;
    target.reduce = CityAdvance.reduce;
    target.mode = reducer.Modes.Overall;
  })
  describe("basic", function() {
    beforeEach(function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'city': 1, 'neighbours': [ 3 ] },
        3: { id: 3, 'tribes': 2, 'city': 2, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 2, 'city': 1, 'neighbours': [ 3 ] },
      }
    })
    it('should give negative amount', function() {
      target.max_city = 2;
      target.startAmount = -1;
      target.startAmount.should.equal(-1);
      _.keys(target.ok({}).areas).should.deep.equal([ '2', '4' ]);
      target.ok({}).ok.should.equal(true);
      target.ok({ 4: { city: 1 }}).amount.should.equal(0);
      target.ok({ 4: { city: 1 }}).ok.should.equal(true);
      _.keys(target.ok({ 4: { city: 1 }}).areas).should.deep.equal(['2']);
      target.ok({2: { city: 1 }}).ok.should.equal(true);
    })
    it('should return false on too big city numbers', function() {
      target.startAmount = -1;
      target.max_city = 2;
      target.ok({ 4: { city: 2 }}).should.equal(false);
      target.ok({ 3: { city: 3 }}).should.equal(false);
    })
    it('should increase the amount on too many additions', function() {
      target.startAmount = -1;
      target.max_city = 2;
      target.ok({ 4: { city: 1 }, 2: { city: 1 }}).amount.should.equal(1);
    })
    it('should not let increase over max_city', function() {
      target.startAmount = -3;
      target.max_city = 3;
      engine.map.areas[3].tribes = 3;
      _.keys(target.ok({}).areas).should.deep.equal([ '2', '3', '4' ]);
      target.max_city = 2;
      _.keys(target.ok({}).areas).should.deep.equal([ '2', '4' ]);
    })
  })
})