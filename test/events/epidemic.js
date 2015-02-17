var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')

describe('Epidemic', function() {
    beforeEach(function() {
        runEvent = eventRunner.runEvent;
        event = require('../../src/events/epidemic')
        engine = pocketciv.Engine;
        engine.map.areas = {
            5: { id: 5, tribes: 2, neighbours: [ 4 ]},
            4: { id: 4, tribes: 3, neighbours: [ 3, 5 ]},
            3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, neighbours: [ 3 ] },
        }
    });
    it('should expand to other areas from 5', function(done) {
        var deckk = [{ circle: 5 }, { square: 5 }]
        var areaa = [ 4 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        engine.reducer = function(rdc, done) {
            rdc.startRegion.id.should.equal(5);
            done(rdc.ok(areaa).changes)
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
            })
            done();
        })
    });
    it('should expand to other areas from 5 using only tribes', function(done) {
        var deckk = [{ circle: 5 }, { square: 4 }]
        var areaa = [ 4 ]
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '1' },
            })
            done();
        })
    });
    it('should stop to area 3', function(done) {
        var deckk = [{ circle: 5 }, { square: 6 }]
        var areaa = [ 4, 2 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
            })
            done();
        })
    });
    it('should go on to area 2', function(done) {
        engine.map.areas[3].tribes = 3
        var deckk = [{ circle: 5 }, { square: 7 }]
        var areaa = [ 4, 3 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        engine.reducer = function(rdc, done) {
            rdc.startRegion.id.should.equal(5);
            done(rdc.ok(areaa).changes)
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
                3: {'tribes': '1' },
            })
            done();
        })
    });
    it('should stop to area 5 when starting from 4', function(done) {
        engine.map.areas[3].tribes = 3
        var deckk = [{ circle: 4 }, { square: 8 }]
        var areaa = [ 5, 2 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        engine.reducer = function(rdc, done) {
            rdc.startRegion.id.should.equal(4);
            done(rdc.ok([ 5 ]).changes)
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
            })
            done();
        })
    });
    it('should stop to area 3 when starting from 4', function(done) {
        var deckk = [{ circle: 4 }, { square: 8 }]
        var areaa = [ 4, 2 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        engine.reducer = function(rdc, done) {
            rdc.startRegion.id.should.equal(4);
            done(rdc.ok([ 5 ]).changes)
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                4: {'tribes': '0' },
                5: {'tribes': '0' },
            })
            done();
        })
    });
    it('should stop when there is only 2 tribes left', function(done) {
        engine.map.areas[3].tribes = 1
        var deckk = [{ circle: 5 }, { square: 11 }]
        var areaa = [ 4, 3, 2 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        engine.reducer = function(rdc, done) {
            rdc.startRegion.id.should.equal(5);
            done(rdc.ok(areaa).changes)
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
                3: {'tribes': '0' },
                2: {'tribes': '2' },
            })
            done();
        })
    });
})