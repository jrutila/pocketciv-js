var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

describe('Flood', function() {
    var engine = pocketciv.Engine;
    var runEvent = eventRunner.runEvent;
    var done = function() { throw "Nomplemented"; };
    var getContext = function() {
        var ctx = new PhaseContext(engine);
        ctx.done = function() {
            done.call(this);
        };
        return ctx;
    }
    var deck = [];
    var changes = undefined;
    engine.drawer = function(dde, done) { done(deck.shift()) }
    engine.reducer = function(rdc, done) {
        var ok = rdc.ok(changes);
        if (ok.ok)
            done(rdc.ok(changes));
        else {
            throw "NotOK";
        }
    }
    beforeEach(function() {
        event = require('../../src/events/flood')
        // 5 - 4 - 3
        // sea    /
        //       2
        engine.map.areas = {
            5: { id: 5, neighbours: [ 4, 'sea' ]},
            4: { id: 4, neighbours: [ 3, 5, 'sea' ]},
            3: { id: 3, tribes: 4, farm: true, city: 2, neighbours: [ 4, 2 ] },
            2: { id: 2, neighbours: [ 3, 'sea' ] },
        }
    })
    it('should be a flood if not next to sea', function(d) {
        deck = [{ 'circle': 3}];
        done = function() {
            this.changes.should.deep.equal({ 3: {'tribes': -2, 'farm': false, 'city': -1, 'forest': true}});
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('should be a TSUNAMI if next to sea', function(d) {
        engine.map.areas[5].tribes = 4;
        engine.map.areas[5].city = 4;
        engine.map.areas[4].tribes = 5;
        engine.map.areas[4].city = 5;
        
        deck = [{ circle: 5 }, { square: 7 }]
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -4, 'city': -2 },
                4: {'tribes': -5, 'city': -1 },
                });
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('tsunami case 1', function(d) {
        engine.map.areas[5].tribes = 4;
        engine.map.areas[5].city = 4;
        engine.map.areas[4].tribes = 5;
        engine.map.areas[4].city = 5;
        
        deck = [{ circle: 5 }, { square: 4 }]
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -4 },
                4: {'tribes': -4 },
                });
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('tsunami case 2', function(d) {
        engine.map.areas[5].tribes = 4;
        engine.map.areas[5].city = 4;
        engine.map.areas[4].tribes = 0;
        engine.map.areas[4].city = 5;
        
        deck = [{ circle: 5 }, { square: 5 }]
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -4, 'city': -1 },
                4: {'city': -3 },
                });
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
})