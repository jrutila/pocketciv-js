var should = require('chai').should()
var pocketciv = require('../../src/core/pocketciv')
var reducer = require('../../src/core/reducer')
var event = require('../../src/core/event')
var _ = require('underscore')
var CityAdvance = require('../../src/phases/city_advance').CityAdvance;

var engine = pocketciv.Engine

describe('Reducer', function() {
  describe('usage', function() {
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
      ok.changes.should.deep.equal({ 1: { 'tribes': (-1*opts.initial[1].tribes) }});
      ok.ok.should.be.false;
      ok.amount.should.equal(opts.amount - 4);
      
      //ok = target.ok({ 1: null, 2: null })
      ok = target.ok([ 1, 2 ])
      ok.current.should.deep.equal(_.omit(opts.initial, '1', '2'));
      ok.changes.should.deep.equal(
        { 1: { 'tribes': (-1*opts.initial[1].tribes) },
          2: { 'tribes': (-1*opts.initial[2].tribes) }}
        );
      ok.ok.should.be.false;
      ok.amount.should.equal(opts.amount - 4*2);
      
      ok = target.ok([ 1, 2, 3 ])
      ok.current.should.deep.equal({});
      ok.changes.should.deep.equal(
        { 1: { 'tribes': (-1*opts.initial[1].tribes) },
          2: { 'tribes': (-1*opts.initial[2].tribes) },
          3: { 'tribes': -2 }}
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
          1: { 'tribes': 8, 'city': 2 },
          2: { 'tribes': 8 },
          3: { 'tribes': 8, 'city': 1 },
        },
        // Increase city at cost of three and only two of them separetely
        reduce: function(key, chg) {
          var dcity = chg.city - (this.initial[key].city || 0);
          return { 'tribes': this.initial[key].tribes - dcity*3, 'city': chg.city };
        },
      }
      var target = new reducer.Reducer(opts);
      
      var ok = target.ok({});
      ok.changes.should.deep.equal({});
      ok.current.should.deep.equal(target.initial);
      ok.ok.should.be.true;
      ok.amount.should.equal(opts.amount);
      
      ok = target.ok({ 1: { 'city': 3 }})
      ok.current.should.deep.equal(opts.initial);
      ok.changes.should.deep.equal({
        1: { 'tribes': -3, 'city': 1 }});
      ok.ok.should.be.true;
      ok.amount.should.equal(0);
    });
  });
  describe('basic', function() {
    it('should have original_amoount', function() {
      var target = new reducer.Reducer({
        amount: 10
      });
      var ok = target.ok({});
      ok.amount.should.equal(10)
    });
    it('should have start region', function() {
      var opts = {
        initial: {
          5: { 'tribes': 4 },
          3: { 'tribes': 5 }
        },
        current: function(chg, key, val) {
          if (key == undefined)
            this.current[5] = this.initial[5];
        }
      };
      var target = new reducer.Reducer(opts);
      var ok = target.ok({});
      ok.current.should.deep.equal(_.omit(opts.initial, '3'))
    });
    describe('worker mode', function() {
      describe('area walker', function() {
        var target = null;
        var opts = null;
        beforeEach(function() {
          engine.map.areas = {
            4: { id: 4, 'tribes': 3, 'neighbours': [ 3 ] },
            3: { id: 3, 'tribes': 2, 'neighbours': [ 4,2  ] },
            2: { id: 2, 'tribes': 2, 'neighbours': [ 3 ] },
          }
          opts = {
            amount: 4,
            map: engine.map.areas,
            initial: engine.map.areas,
            // This is basic amount walker reducing tribes
            reduce: function(key, chg) {
              if (!_.has(this.current, key))
              {
                return false;
              }
              // ignore chg
              var val = Math.min(this.initial[key].tribes, this.amount);
              this.amount -= val;
              return { 'tribes': this.initial[key].tribes - val };
            }
          };
          target = new reducer.Reducer(opts);
        }),
        it('should tell if the given regions are ok', function() {
          var ok = target.ok([4, 3]);
          ok.amount.should.equal(0);
          ok.changes.should.deep.equal({
            4: { 'tribes': -3 },
            3: { 'tribes': -1 }
            //        ----  -4
          });
          ok.ok.should.equal.true;
          ok = target.ok([3, 4]);
          ok.changes.should.deep.equal({
            4: { 'tribes': -2 },
            3: { 'tribes': -2 }
            //        ----  -4
          });
          ok.ok.should.equal.true;
        });
        it('should return false if amount is above zero', function() {
          target.ok([2]).ok.should.be.false;
        });
        it('should return false if the phase is not applicable', function() {
          var ok =  target.ok([2,2]);
          ok.failed.length.should.equal(1);
          ok.current.should.deep.equal(opts.initial)
        });
        it('should return possible areas if no start', function() {
          target.ok([]).current.should.deep.equal(engine.map.areas);
        });
        it('should return possible areas if a start', function() {
          target.opts.pre = [ 2 ];
          var ok = target.ok([]);
          ok.amount.should.equal(opts.amount - 2);
          ok.current.should.deep.equal(
            _.pick(engine.map.areas, 3,4)
          );
          ok.changes.should.deep.equal({
            2: { 'tribes': -2 },
          });
        });
      });
      describe('overall reducer', function() {
        var target = null;
        var opts = null;
        beforeEach(function() {
          engine.map.areas = {
            5: { id: 5, 'tribes': 1, 'neighbours': [ 4 ] },
            4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 5 ] },
            3: { id: 3, 'tribes': 2, 'neighbours': [ 4 ] },
          }
          opts = {
            amount: 4,
            map: engine.map.areas,
            initial: engine.map.areas,
            reduce: function(key, chg) {
              this.amount -= this.initial[key].tribes - chg.tribes;
              return { 'tribes': chg.tribes };
            }
          };
          target = new reducer.Reducer(opts);
        })
        it('should return changes', function() {
          var ok = target.ok({ 3: { 'tribes': 0 }, 4: { 'tribes': 1 } });
          ok.changes.should.deep.equal({
            3: { 'tribes': -2 },
            4: { 'tribes': -2 },
          });
        })
        it('should give possible areas', function() {
          target.ok({}).current.should.deep.equal(engine.map.areas)
          var ok = target.ok({ 3: { 'tribes': 1 } });
          ok.ok.should.equal(false);
          _.keys(ok.current).should.deep.equal([ '3', '4', '5' ]);
        })
        it('should have remaining amount', function() {
          target.ok({}).amount.should.equal(4)
          target.ok({ 3: { 'tribes': 1 } }).amount.should.equal(3);
        })
      });
    });
  });
});

describe('City Advance (worker)', function() {
  describe("basic", function() {
    var target = null;
    var opts = null;
    var ok = null;
    beforeEach(function() {
      engine.map.areas = {
        4: { id: 4, 'tribes': 3, 'city': 1, 'neighbours': [ 3, 1 ] },
        3: { id: 3, 'tribes': 2, 'city': 2, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 5, 'city': 1, 'neighbours': [ 3 ] },
        1: { id: 1, 'neighbours': [ 4 ] },
      };
      opts = {
        map: engine.map.areas,
        initial: engine.map.areas,
        reduce: CityAdvance.reduce,
        current: CityAdvance.current,
        check: CityAdvance.check,
      };
      target = new reducer.Reducer(opts);
    })
    it('basic case', function() {
      opts.amount = 0;
      opts.max_city = 2;
      opts.city_amount = 1;
      
      ok = target.ok({});
      ok.amount.should.equal(0);
      _.keys(ok.current).should.deep.equal(['2','3','4']);
      ok.ok.should.be.true;
      
      ok = target.ok({ 4: { city: 2 }});
      ok.amount.should.equal(2);
      ok = target.ok({ 4: { city: 2, tribes: 1 }});
      ok.amount.should.equal(0);
      ok.changes.should.deep.equal({
        4: { tribes: -2, city: 1}
      });
      ok = target.ok({ 4: { city: 2 }, 3: { tribes: 1 }, 2: { tribes: 4 }});
      ok.amount.should.equal(0);
      ok.changes.should.deep.equal({
        4: { city: +1 },
        2: { tribes: -1 },
        3: { tribes: -1 }
      });
    })
    it('should return false on too big city numbers', function() {
      opts.city_amount = 1;
      opts.max_city = 3;
      engine.map.areas[3].tribes = 3;
      
      ok = target.ok({});
      ok.amount.should.equal(0);
      _.keys(ok.current).should.deep.equal(['2', '3', '4']);
      ok.ok.should.be.true;
      
      ok = target.ok({ 4: { city: 3 }});
      ok.amount.should.equal(5);
      ok.failed.length.should.equal(1);
    })
    it('should let only add by the amount', function() {
      opts.amount = 0;
      opts.city_amount = 1;
      opts.max_city = 3;
      engine.map.areas[3].tribes = 3;
      
      ok = target.ok({ 2: { city: 3 }});
      // Because amount is only 1
      ok.ok.should.be.false;
      ok.failed.length.should.equal(1);
      
      ok = target.ok({ 2: { city: 2 }, 4: { city: 2 }});
      // Because amount is only 1
      ok.ok.should.be.false;
      ok.failed.length.should.equal(1);
    })
    it('should not let increase over max_city', function() {
      opts.amount = 0;
      opts.city_amount = 1;
      opts.max_city = 2;
      engine.map.areas[3].tribes = 3;
      
      _.keys(target.ok({}).current).should.deep.equal([ '2', '3', '4' ]);
      
      ok = target.ok({ 3: { city: 3 }});
      ok.failed.length.should.equal(1);
      //ok.ok.should.be.false;
    })
    it('should take the discount into account', function() {
      opts.amount = 0;
      opts.city_amount = 1;
      opts.max_city = 2;
      opts.discount = 1;
      
      ok = target.ok({ 4: { city: 2 }, 3: { tribes: 1 }});
      ok.ok.should.be.true;
      ok.changes.should.deep.equal({
        4: { city: 1 },
        3: { tribes: -1 }
      });
    })
  })
  describe("capitol", function() {
    var target = null;
    var opts = null;
    var ok = null;
    beforeEach(function() {
      engine.map.areas = {
        2: { id: 2, 'city': 4, 'tribes': 7, 'mountain': true, 'farm': false, 'neighbours': [ 1 ] },
        1: { id: 1, 'city': 2, 'tribes': 1, 'forest': true, 'neighbours': [ 2 ] },
      };
      opts = {
        map: engine.map.areas,
        initial: engine.map.areas,
        city_amount: 2,
        max_city: 4,
        capitol: true,
        amount: 0,
        reduce: CityAdvance.reduce,
        current: CityAdvance.current,
        check: CityAdvance.check,
      };
      target = new reducer.Reducer(opts);
    })
    describe('in one area', function() {
      it('should work on empty', function() {
        ok = target.ok({});
        ok.amount.should.equal(0);
        ok.current.should.deep.equal(engine.map.areas);
      })
      it('should work with capitol from same area', function() {
        ok = target.ok({ 2: { city: 5, tribes: 7 }});
        ok.amount.should.equal(5);
        ok = target.ok({ 2: { city: 5, tribes: 2 }});
        ok.amount.should.equal(0);
      })
      it('should work without other area', function() {
        ok = target.ok({ 2: { city: 5, tribes: 3 }});
        ok.amount.should.equal(1);
        ok.ok.should.be.false;
        ok = target.ok({ 2: { city: 5, tribes: 3 }, 1: { tribes: 0 }});
        ok.amount.should.equal(0);
        ok.ok.should.be.false;
      })
      it('should work with double increase', function() {
        engine.map.areas[1].city = 3;
        engine.map.areas[1].tribes = 5;
        ok = target.ok({ 1: { city: 5, tribes: 0 }});
        ok.ok.should.be.false;
        ok.amount.should.equal(4);
        ok = target.ok({ 1: { city: 5, tribes: 0 }, 2: { tribes: 3 }});
        ok.ok.should.be.false;
        ok.amount.should.equal(0);
        ok = target.ok({ 1: { city: 5, tribes: 0, forest: false }, 2: { tribes: 3 }});
        ok.ok.should.be.true;
        ok.amount.should.equal(0);
      })
    })
    describe('in multiple areas', function() {
      it('should work with other area', function() {
        ok = target.ok({ 2: { city: 5, tribes: 2 }, 1: { tribes: 0, city: 3 }});
        ok.amount.should.equal(2);
        ok.ok.should.be.false;
        ok = target.ok({ 2: { city: 5, tribes: 0 }, 1: { tribes: 0, city: 3 }});
        ok.amount.should.equal(0);
        ok.ok.should.be.false;
      })
    })
    describe('requires decimated resource', function() {
      it('in same area', function() {
        ok = target.ok({ 2: { city: 5, tribes: 2, mountain: false }});
        ok.amount.should.equal(0);
        ok.ok.should.be.true;
      })
      it('in other area', function() {
        ok = target.ok({ 2: { city: 5, tribes: 0 }, 1: { tribes: 0, city: 3, forest: false }});
        ok.amount.should.equal(0);
        ok.ok.should.be.true;
      })
      it('but does not allow multiple decimated resources', function() {
        ok = target.ok({ 2: { city: 5, tribes: 0, mountain: false },
                         1: { tribes: 0, city: 3, forest: false }});
        ok.ok.should.be.false;
      })
    })
    describe('should work', function() {
      beforeEach(function() {
        var areas =
        { "3": { "id": 3, "city": 4, "mountain": true, "forest": true, "tribes": 7, "farm": true, "neighbours": [ 4, 5, 6, 8, "sea" ] },
          "4": { "id": 4, "tribes": 3, "city": 2, "mountain": true, "forest": true, "farm": true, "neighbours": [ 3, 8, "sea", "frontier" ] },
          "5": { "id": 5, "tribes": 2, "mountain": true, "forest": true, "neighbours": [ 3, 6, 8, "sea", "frontier" ] },
          "6": { "id": 6, "tribes": 1, "neighbours": [ 3, 5, 8 ], "forest": true },
          "8": { "id": 8, "neighbours": [ 3, 4, 5, 6, "frontier" ], "desert": true }
        }
        opts = {
          map: areas,
          initial: areas,
          reduce: CityAdvance.reduce,
          current: CityAdvance.current,
          check: CityAdvance.check,
        };
        opts.amount = 0;
        opts.max_city = 2;
        opts.city_amount = 1;
        opts.capitol = true;
        target = new reducer.Reducer(opts);
      })
      it('case 1', function() {
        ok = target.ok({3: { city: 5, tribes: 2, forest: false }});
        ok.ok.should.be.true;
      }) 
    })
  })
})