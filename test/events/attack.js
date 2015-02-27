var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var reducer = require('../../src/core/reducer')
var attack = require('../../src/events/attack')
var _ = require('underscore')

describe('Attack (worker)', function() {
  var target = null;
  var opts = null;
  var ok = null;
  beforeEach(function() {
    opts = {
      city_reduce: 5,
      gold_reduce: 2,
      reduce: attack.reducer.reduce,
      current: attack.reducer.current,
    }
    target = new reducer.Reducer(opts);
  });
  describe('basic', function() {
    beforeEach(function() {
      opts.initial = opts.map = {
        4: { id: 4, 'tribes': 3, 'city': 1, 'neighbours': [ 3 ] },
        3: { id: 3, 'tribes': 2, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 2, 'neighbours': [ 3 ] },
      }
    });
    it('should work in basic case', function() {
      opts.amount = 9;
      opts.pre = [4];
      opts.initial.gold = 7;
      target.ok([3]).changes.should.deep.equal({
        4: { 'tribes': -3, 'city': -1 },
        3: { 'tribes': -1 },
        'gold': -2
      });
    });
  });
  describe('automatic movement', function() {
    it('attack should go to lowest tribe', function() {
      opts.initial = opts.map = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 2 ] },
        3: { id: 3, 'tribes': 2, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4 ] },
      }
      opts.amount = 4;
      opts.pre = [4];
      target.ok([2]).changes.should.deep.equal({
        4: { tribes: -3 },
        2: { tribes: -1 },
      });
      opts.pre= [2];
      target.ok([3, 4]).changes.should.deep.equal({
        4: { tribes: -1 },
        3: { tribes: -2 },
        2: { tribes: -1 },
      });
      ok = target.ok([]);
      _.keys(ok.current).should.deep.equal(['3']);
      ok.ok.should.be.false;
      
      ok = target.ok([4,3]);
      ok.failed.length.should.equal(1);
      
      ok = target.ok([3]);
      _.keys(ok.current).should.deep.equal([ '4' ])
      ok.ok.should.be.false;
      
      ok = target.ok([3, 4]);
      _.keys(ok.current).should.deep.equal([]);
      ok.ok.should.be.true;
    });
    it('should not go to empty region', function() {
      opts.initial = opts.map = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 2 ] },
        3: { id: 3, 'tribes': 0, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4 ] },
      }
      opts.amount = 4;
      opts.pre = [4];
      _.keys(target.ok([]).current).should.deep.equal(['2'])
      target.ok([3]).failed.length.should.equal(1)
      target.ok([2]).ok.should.be.true;
    });
    it('should be able to start from empty region', function() {
      opts.initial = opts.map = {
        4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 2 ] },
        3: { id: 3, 'neighbours': [ 4, 2 ] },
        2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4 ] },
      }
      opts.amount = 3;
      opts.pre = [3];
      target.ok([3]).failed.length.should.equal(1);
      _.keys(target.ok([]).current).should.deep.equal(['2'])
      var ok = target.ok([2]);
      ok.failed.length.should.equal(0);
      _.keys(ok.current).should.deep.equal(['4'])
      target.ok([2, 4]).changes.should.deep.equal({
        4: { 'tribes': -2 },
        2: { 'tribes': -1 },
      })
    });
    describe('attack should go to the highest city in tribe tie', function() {
      beforeEach(function() {
        //       4
        //      / \
        // 3 - 2 - 5
        opts.initial = opts.map = {
          5: { id: 5, 'tribes': 1, 'city': 5, 'neighbours': [ 4, 2 ] },
          4: { id: 4, 'tribes': 1, 'city': 3, 'neighbours': [ 2, 5 ] },
          3: { id: 3, 'tribes': 0, 'city': 4, 'neighbours': [ 2 ] },
          2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4, 5 ] },
          gold: 14,
        }
      })
      it('case 1', function() {
        opts.amount = 33;
        opts.pre = [4];
        _.keys(target.ok([]).current).should.deep.equal([ '5' ])
        var ok = target.ok([5]);
        _.keys(ok.current).should.deep.equal([  ])
        ok.ok.should.be.true;
        ok.amount.should.equal(0);
        ok.changes.should.deep.equal({
          4: { 'city': -3, 'tribes': -1 },
          5: { 'tribes': -1, 'city': -3 },
          'gold': -12,
        })
      })
      it('case 2', function() {
        opts.amount = 27;
        opts.pre = [3];
        _.keys(target.ok([2]).current).should.deep.equal([ '5' ])
        target.ok([2, 5]).changes.should.deep.equal({
          3: { 'city': '-4' },
          2: { 'tribes': '-1' },
          5: { 'tribes': '-1', 'city': '-1' },
          'gold': '-10',
        })
        opts.amount = 26;
        target.ok([2, 5]).changes.should.deep.equal({
          3: { 'city': -4 },
          2: { 'tribes': -1 },
          5: { 'tribes': -1 },
          'gold': -8,
        })
      })
    });
    describe('attack should go to the highest city if there is no tribes', function() {
      beforeEach(function() {
        //       4
        //      / \
        //     2 - 5
        //      \ /
        //       3
        opts.initial = opts.map = {
          5: { id: 5, 'city': 5, 'neighbours': [ 3, 4, 2 ] },
          4: { id: 4, 'city': 4, 'neighbours': [ 2, 5 ] },
          3: { id: 3, 'tribes': 0, 'city': 3, 'neighbours': [ 2, 5 ] },
          2: { id: 2, 'city': 2, 'neighbours': [ 3, 4, 5 ] },
          gold: 14,
        }
      })
      it('case 1', function() {
        opts.amount = 33;
        opts.pre = [4];
        _.keys(target.ok([]).current).should.deep.equal([ '5' ])
        var ok = target.ok([5]);
        ok.ok.should.be.true;
        _.keys(ok.current).should.deep.equal([ ])
      })
      it('case 2', function() {
        opts.map[2].tribes = 1;
        opts.amount = 33;
        opts.pre = [4];
        _.keys(target.ok([]).current).should.deep.equal([ '2' ])
        var ok = target.ok([2]);
        ok.ok.should.be.true;
        _.keys(ok.current).should.deep.equal([ ])
      })
      
    });
    describe('user should choose if there is a tie', function() {
      beforeEach(function() {
        //       4
        //      / \
        // 3 - 2 - 5
        opts.initial = opts.map = {
          5: { id: 5, 'tribes': 1, 'city': 3, 'neighbours': [ 4, 2 ] },
          4: { id: 4, 'tribes': 1, 'city': 3, 'neighbours': [ 2, 5 ] },
          3: { id: 3, 'tribes': 0, 'city': 4, 'neighbours': [ 2 ] },
          2: { id: 2, 'tribes': 1, 'neighbours': [ 3, 4, 5 ] },
          gold: 7,
        }
      })
      it('case 1', function() {
        opts.amount = 26;
        opts.pre = [3];
        _.keys(target.ok([2]).current).should.deep.equal([ '4', '5' ])
        target.ok([2, 5]).changes.should.deep.equal({
          3: { 'city': -4 },
          2: { 'tribes': -1 },
          5: { 'tribes': -1 },
          'gold': -7,
        })
        target.ok([2, 4]).changes.should.deep.equal({
          3: { 'city': -4 },
          2: { 'tribes': -1 },
          4: { 'tribes': -1 },
          'gold': -7,
        })
      })
    })
    describe('attack should stop', function() {
      beforeEach(function() {
        //       4
        //      / \
        // 2 - 3   5
        opts.initial = opts.map = {
          5: { id: 5, 'tribes': 5, 'neighbours': [ 4 ] },
          4: { id: 4, 'tribes': 3, 'neighbours': [ 3, 5 ] },
          3: { id: 3, 'tribes': 0, 'neighbours': [ 4, 2 ] },
          2: { id: 2, 'tribes': 1, 'neighbours': [ 3 ] },
        }
      })
      it('case 1', function() {
        opts.amount = 4;
        opts.pre = [2];
        _.keys(target.ok([]).current).should.deep.equal([ ])
        target.ok([3, 4]).failed.length.should.equal(1)
        target.ok([4, 3]).failed.length.should.equal(1)
      })
      it('case 2', function() {
        opts.amount = 8;
        opts.pre = [4];
        _.keys(target.ok([]).current).should.deep.equal([ '5' ])
        target.ok([5]).changes.should.deep.equal({
          4: { 'tribes': -3 },
          5: { 'tribes': -5 },
        });
        target.ok([2]).failed.length.should.equal(1);
      })
      it('case 3', function() {
        opts.amount = 9;
        opts.pre = [5];
        _.keys(target.ok([]).current).should.deep.equal([ '4' ])
        target.ok([4]).changes.should.deep.equal({
          4: { 'tribes': -3 },
          5: { 'tribes': -5 },
        });
        target.ok([2]).failed.length.should.equal(1)
        target.ok([3]).failed.length.should.equal(1)
        target.ok([5]).failed.length.should.equal(1)
      })
      it('case 4', function() {
        //require("../app/scenarios/scenario1").map.areas;
        opts.initial = opts.map = {
          2: { id: 2, 'neighbours': [ 3,8,5 ] },
          3: { id: 3, 'neighbours': [ 1,2,8 ] },
          8: { id: 8, 'tribes': 2, 'neighbours': [ 1,2,3,7 ] },
          5: { id: 5, 'tribes': 0, 'neighbours': [ 2,7 ] },
          7: { id: 7, 'tribes': 1, 'neighbours': [ 5,8 ] },
          1: { id: 1, 'tribes': 1, 'neighbours': [ 3,8 ] },
        }
        opts.amount = 8;
        opts.pre = [2];
        _.keys(target.ok([]).current).should.deep.equal([ '8' ])
        target.ok([8, 7]).changes.should.deep.equal({
          8: { 'tribes': -2 },
          7: { 'tribes': -1 },
        });
    });
    });
  });
});