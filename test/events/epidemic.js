var should = require('chai').should()
var chai = require('chai');
require('mocha');
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

describe('Epidemic', function() {
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
        event = require('../../src/events/epidemic')
        // 5 - 4 - 3 - 2
        engine.map.areas = {
            5: { id: 5, tribes: 2, neighbours: [ 4 ]},
            4: { id: 4, tribes: 3, neighbours: [ 3, 5 ]},
            3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, neighbours: [ 3 ] },
        }
    });
    it('should expand to other areas from 5', function(d) {
        deck = [{ circle: 5 }, { square: 5 }]
        changes = [ 4 ];
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -2 },
                4: {'tribes': -3 },
            });
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('should expand to other areas from 5 using only tribes', function(d) {
        deck = [{ circle: 5 }, { square: 4 }]
        changes = [ 4 ]
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -2 },
                4: {'tribes': -2 },
            })
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('should go on to area 2', function(d) {
        engine.map.areas[3].tribes = 3
        deck = [{ circle: 5 }, { square: 7 }]
        changes = [ 4, 3 ];
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -2 },
                4: {'tribes': -3 },
                3: {'tribes': -2 },
            })
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('should stop to area 5 when starting from 4', function(d) {
        engine.map.areas[3].tribes = 3
        deck = [{ circle: 4 }, { square: 8 }]
        changes = [ 5 ];
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -2 },
                4: {'tribes': -3 },
            })
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('should stop to area 3 when starting from 4', function(d) {
        deck = [{ circle: 4 }, { square: 8 }]
        changes = [ ];
        done = function() {
            chai.assert.fail();
            d();
        }
        chai.assert.throws(function() {
            runEvent(engine, event, { expr: 's' }, getContext())
            }
        );
        d();
    });
    it('should stop when there is only 2 tribes left', function(d) {
        engine.map.areas[3].tribes = 1
        deck = [{ circle: 5 }, { square: 11 }]
        changes = [ 4, 3, 2 ];
        done = function() {
            this.changes.should.deep.equal({
                5: {'tribes': -2 },
                4: {'tribes': -3 },
                3: {'tribes': -1 },
                2: {'tribes': -3 },
            })
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
})