var should = require('chai').should();
var expect = require('chai').expect;
var pocketciv = require('../../src/core/pocketciv');
var ctx = require('../../src/core/context').Context;

describe("End of era", function() {
    var engine;
    var cards = [];
    var reduce = [];
    var areachanges = [];
    beforeEach(function() {
        engine = new pocketciv.EngineBuild();
        engine.map.areas = {
            1: { id:1, tribes: 5 }
        }
        engine.drawer = function(deck, drawn, canstop) {
            var card = deck.draw(cards.shift());
            drawn(card);
        };
        engine.areaChanger = function(ctx, done) {
            var cc = areachanges.shift();
            if (cc) {
                cc.should.deep.equal(ctx.changes);
            }
            done.call(engine);
        };
        engine.reducer = function(rdc, done) {
            var r = reduce.shift();
            var ok = rdc.ok(r);
            if (ok.ok)
                done(ok);
            else {
                throw "NotOK";
            }
        }
    });
    describe("when happening cleanly", function() {
        beforeEach(function() {
            engine.deck.usedCards = [1,2,4,5,6,7,8,9,10,16,12,14];
            cards = [13];
        });
        it("should refresh the event deck", function() {
            engine.runPhase("event");
            engine.era.should.equal(2);
            engine.deck.cardsLeft.should.equal(13);
        });
        it("should run end of era post funcs", function() {
            engine["end_of_era.post"] = function(ctx) {
                ctx.change(1, { tribes: 1 });
                ctx.done && ctx.done();
            };
            areachanges = [{ 1: { tribes: 1 }}]
            engine.runPhase("event");
            engine.map.areas["1"].tribes.should.equal(6);
        });
    });
    describe("when happening in the middle of the event", function() {
        beforeEach(function() {
            engine.deck.usedCards = [1,2,4,5,6,7,8,9,10,13,12];
            cards = [16, 1, 2]; // epidemic + area 1 + square: 4
        });
        it("should just work #1", function(done) {
            engine.deck.usedCards.push(14); // Only one card left
            engine.deck.cardsLeft.should.equal(1);
            
            engine["end_of_era.post"] = function(ctx) {
                ctx.change(1, { tribes: 1 });
                ctx.done && ctx.done();
            };
            engine.nextPhase = function() {
                engine.map.areas["1"].tribes.should.equal(2);
                done();
            };
            reduce.push([]);
            areachanges = [{ 1: { tribes: 1 }}, { 1: { tribes: -4 }}]
            engine.runPhase("event");
        });
        it("should just work #2", function(done) {
            engine.deck.cardsLeft.should.equal(2);
            
            engine["end_of_era.post"] = function(ctx) {
                ctx.change(1, { tribes: 1 });
                ctx.done && ctx.done();
            };
            engine.nextPhase = function() {
                engine.map.areas["1"].tribes.should.equal(2);
                done();
            };
            reduce.push([]);
            areachanges = [{ 1: { tribes: 1 }}, { 1: { tribes: -4 }}]
            engine.runPhase("event");
        });
    });
});