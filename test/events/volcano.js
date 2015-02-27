var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

describe('Volcano', function() {
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
        event = require('../../src/events/volcano')
        // 5 - 4 - 3m
        // sea    /
        //       2v
        engine.map.areas = {
            5: { id: 5, tribes: 5, neighbours: [ 4, 'sea' ]},
            4: { id: 4, tribes: 4, city: 4, neighbours: [ 3, 5, 'sea' ]},
            3: { id: 3, tribes: 3, city: 3, mountain: true, farm: true, forest: true, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 2, city: 2, volcano: true, forest: true, farm: true, neighbours: [ 3, 'sea' ] },
        }
    })
    it('should work on non-mountain area', function(d) {
        deck = [{ 'circle': 5}];
        done = function() {
            this.changes.should.deep.equal({ 5: {'tribes': -4, 'volcano': true}});
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('should work on mountain area', function(d) {
        deck = [{ 'circle': 3}];
        done = function() {
            this.changes.should.deep.equal({ 3: {'tribes': -2, 'city': -2, 'volcano': true, 'farm': false}});
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('should work on volcano area', function(d) {
        deck = [{ 'circle': 2}];
        done = function() {
            this.changes.should.deep.equal({
                2: {'tribes': -2, 'city': -2, 'farm': false, 'forest': false, 'desert': true},
                3: {'tribes': -2}
            });
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('engineering should prevent city on volcano area', function(d) {
        engine.acquired = ['engineering'],
        deck = [{ 'circle': 2}];
        done = function() {
            this.changes.should.deep.equal({
                2: {'tribes': -2, 'city': -1, 'farm': false, 'forest': false, 'desert': true},
                3: {'tribes': -2}
            });
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('medicine should give tribes in non-volcano', function(d) {
        engine.acquired = ['medicine'],
        deck = [{ 'circle': 5}];
        done = function() {
            this.changes.should.deep.equal({ 5: {'tribes': -3, 'volcano': true}});
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
    it('medicine should give tribes on volcano area and neighbours', function(d) {
        engine.acquired = ['medicine'],
        deck = [{ 'circle': 2}];
        done = function() {
            this.changes.should.deep.equal({
                2: {'tribes': -1, 'city': -2, 'farm': false, 'forest': false, 'desert': true},
                3: {'tribes': -1}
            });
            d();
        };
        runEvent(engine, event, { expr: 's' }, getContext());
    });
})