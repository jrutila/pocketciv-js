var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

describe('Famine', function() {
    var engine = {};
    var runEvent = eventRunner.runEvent;
    var done = function() { throw "Notimplemented"; };
    var getContext = function() {
        var ctx = new PhaseContext(engine);
        ctx.done = function() {
            done.call(this);
        };
        return ctx;
    }
    beforeEach(function() {
        event = require('../../src/events/famine')
        engine = pocketciv.Engine;
        engine.drawer = function(deck, done) { done({ 'circle': 5}) }
    })
    it('should cause tribes to zero, no farms', function(d) {
        engine.map.areas = { 5: { id: 5, tribes: 3, farm: true } }
        done = function() {
            this.changes.should.deep.equal(
                {5: {tribes:-3,farm:false}}
                )
            d();
        }
        runEvent(engine, event, {}, getContext());
    });
    it('should cause tribes to zero, no farms and city -2', function(d) {
        engine.map.areas = { 5: { id: 5, tribes: 3, farm: true, city: 3 } }
        done = function() {
            this.changes.should.deep.equal(
                {5: {tribes:-3,farm:false, city:-2}}
                )
            d();
        }
        runEvent(engine, event, {}, getContext());
    });
    it('should cause tribes to zero, no farms and city', function(d) {
        engine.map.areas = { 5: { id: 5, tribes: 3, farm: true, city: 1 } }
        done = function() {
            this.changes.should.deep.equal(
                {5: {tribes:-3,farm:false, city:-1}}
                )
            d();
        }
        runEvent(engine, event, {}, getContext());
    });
    it('should cause tribes to zero', function(d) {
        engine.map.areas = { 5: { id: 5, tribes: 3 } }
        done = function() {
            this.changes.should.deep.equal(
                {5: {tribes:-3}}
                )
            d();
        }
        runEvent(engine, event, {}, getContext());
    });
    it('with irrigation should not decimate farm and city -1', function(d) {
        engine.map.areas = { 5: { id: 5, tribes: 3, farm: true, city: 2 } }
        engine.advances = {'irrigation': require("../../src/advances/irrigation")};
        engine.acquired = ['irrigation'];
        done = function() {
            this.changes.should.deep.equal(
                {5: {tribes:-3, city:-1}}
                )
            d();
        }
        runEvent(engine, event, {}, getContext());
    });
});