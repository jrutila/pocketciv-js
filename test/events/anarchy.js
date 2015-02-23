var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var _ = require('underscore')

describe('Anarchy', function() {
    var deck = [];
    var reduces = [];
    var runEvent = eventRunner.runEvent;
    var event = require('../../src/events/anarchy');
    var engine = new pocketciv.EngineBuild();
    
    engine.drawer = function(d, done) { done(deck.shift()) }
    engine.reducer = function(reducer, done) {
        var chg = reduces.shift();
        var rdc = reducer.ok(chg);
        if (rdc.ok == false)
            console.log(rdc)
        rdc.ok.should.be.true;
        done(rdc.changes, rdc.chg);
    }
    
    describe('basic', function() {
        beforeEach(function() {
            engine.map.areas = {
                1: { tribes: 5, city: 3 },
                2: { tribes: 14, city: 4 },
                3: { tribes: 6 },
                4: { city: 2 },
                5: { },
            }
            engine.acquired = [];
            engine.params = {};
            hasLaw = false;
        });
        it('should work', function(done) {
            runEvent(engine, event, {}, function(chg) {
                chg.should.deep.equal({
                    1: { tribes: "-3", city: "-1" },
                    2: { tribes: "-12", city: "-4" },
                });
                done();
            });
        });
        it("literacy should reduce 5", function(done) {
            engine.acquire('literacy');
            runEvent(engine, event, {}, function(chg) {
                chg.should.deep.equal({
                    1: { tribes: "-5", city: "-1" },
                    2: { tribes: "-14", city: "-3" },
                });
                done();
            });
        });
        it("org. religion should give possibility to choose areas", function(done) {
            engine.acquire('org_religion');
            reduces = [[5,4,3,2]];
            runEvent(engine, event, {}, function(chg) {
                chg.should.deep.equal({
                    2: { tribes: "-12", city: "-4" },
                });
                done();
            });
        });
        it("law should change the reduction", function(done) {
            engine.acquire('law');
            runEvent(engine, event, {}, function(chg) {
                chg.should.deep.equal({
                    1: { tribes: "-3" },
                    2: { tribes: "-4" },
                });
                done();
            });
        });
        it("slave labor should add tribes reductions", function(done) {
            engine.acquire('slave_labor');
            deck = [{ circle: 5 }]; // Reduce 5 tribes
            reduces = [{ 3: {tribes:3}, 2: {tribes:1}, 1:{tribes:1}}];
            runEvent(engine, event, {}, function(chg) {
                chg.should.deep.equal({
                    1: { tribes: "-4", city: "-1" },
                    2: { tribes: "-13", city: "-4" },
                    3: { tribes: "-3" },
                });
                done();
            });
        });
        it("machining should add city reductions", function(done) {
            engine.acquire('machining');
            reduces = [{ 1: {city:1}, 4: {city:1}}];
            runEvent(engine, event, {}, function(chg) {
                chg.should.deep.equal({
                    1: { tribes: "-3", city: "-2" },
                    2: { tribes: "-12", city: "-4" },
                    4: { city: "-1" },
                });
                done();
            });
        });
    });
});