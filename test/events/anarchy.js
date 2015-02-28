var should = require('chai').should()
require('mocha')
var _ = require('underscore')
var common = require('./common');

describe('Anarchy', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    //var done = common.done;
    var runEvent = common.runEvent;
    var state = {};
    state.map = {};
    var event = require('../../src/events/anarchy');
    
    describe('basic', function() {
        beforeEach(function() {
            deck.splice(0,deck.length);
            reduce.splice(0,reduce.length);
            state.map.areas = {
                1: { tribes: 5, city: 3 },
                2: { tribes: 14, city: 4 },
                3: { tribes: 6 },
                4: { city: 2 },
                5: { },
            }
            hasLaw = false;
            state.acquired = [];
        });
        it('should work', function(done) {
            common.done(function() {
                this.changes.should.deep.equal({
                    1: { tribes: -3, city: -1 },
                    2: { tribes: -12, city: -4 },
                });
                done();
            });
            runEvent(event, {}, state);
        });
        it("literacy should reduce 5", function(done) {
            state.acquired = ['literacy'];
            common.done(function() {
                this.changes.should.deep.equal({
                    1: { tribes: -5, city: -1 },
                    2: { tribes: -14, city: -3 },
                });
                done();
            });
            runEvent(event, {}, state);
        });
        it("org. religion should give possibility to choose areas", function(done) {
            state.acquired = ['org_religion'];
            reduce.push([5,4,3,2]);
            common.done(function() {
                this.changes.should.deep.equal({
                    2: { tribes: -12, city: -4 },
                });
                done();
            });
            runEvent(event, {}, state);
        });
        it("law should change the reduction", function(done) {
            state.acquired = ['law'];
            common.done(function() {
                this.changes.should.deep.equal({
                    1: { tribes: -3 },
                    2: { tribes: -4 },
                });
                done();
            });
            runEvent(event, {}, state);
        });
        it("slave labor should add tribes reductions", function(done) {
            state.acquired = ['slave_labor'];
            deck.push({ circle: 5 }); // Reduce 5 tribes
            reduce.push({ 3: {tribes:3}, 2: {tribes:1}, 1:{tribes:1}});
            common.done(function() {
                this.changes.should.deep.equal({
                    1: { tribes: -4, city: -1 },
                    2: { tribes: -13, city: -4 },
                    3: { tribes: -3 },
                });
                done();
            });
            runEvent(event, {}, state);
        });
        it("machining should add city reductions", function(done) {
            state.acquired = ['machining'];
            reduce.push({ 1: {city:1}, 4: {city:1}});
            common.done(function() {
                this.changes.should.deep.equal({
                    1: { tribes: -3, city: -2 },
                    2: { tribes: -12, city: -4 },
                    4: { city: -1 },
                });
                done();
            });
            runEvent(event, {}, state);
        });
    });
});