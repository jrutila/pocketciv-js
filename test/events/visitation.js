var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')

describe('Visitation', function() {
    beforeEach(function() {
        deck = [];
        runEvent = eventRunner.runEvent;
        event = require('../../src/events/visitation')
        engine = pocketciv.Engine;
        engine.drawer = function(d, done) { console.log("draw"+done); done(deck.shift()); }
    });
    describe('trade', function() {
        it('should go to trade if next card is friendly', function(done) {
            deck = [{ friendly: true }, { circle: 3 }]
            console.log("TRADE TRADE TRADE")
            runEvent(engine, event, { visitor: 'nordic' }, function(chg) {
                console.log("TRADE FINISH")
                chg.should.deep.equal({
                    'gold': '+3',
                })
                done();
            })
        });
    });
    
    describe('attack', function() {
        beforeEach(function() {
            engine.map.areas = {
                5: { id: 5, tribes: 2, neighbours: [ 4, 'frontier' ]},
                4: { id: 4, tribes: 3, neighbours: [ 3, 5, 'sea', 'frontier' ]},
                3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
                2: { id: 2, tribes: 5, neighbours: [ 3, 'sea' ] },
            }
        });
        it('should stop the attack if next card is not friendly and area does not neighbour border', function(done) {
            deck = [{ friendly: false }, { circle: 3 }, { square: 3, hexagon: 6 }]
            runEvent(engine, event, { visitor: 'nordic', expr: 's+h' }, function(chg) {
                chg.should.deep.equal({})
                done();
            })
        });
        it('should do the attack if next card is not friendly and area neighbours border', function(done) {
            deck = [{ friendly: false }, { circle: 5 }, { square: 3, hexagon: 6 }]
            engine.reducer = function(reducer, done) {
                reducer.opts.pre.should.deep.equal([5])
                reducer.opts.amount.should.equal(9)
                done({
                5: { 'tribes': '0' }, 4: { 'tribes': '1' }
                });
            }
            runEvent(engine, event, { visitor: 'nordic', expr: 's+h' }, function(chg) {
                chg.should.deep.equal({
                5: { 'tribes': '0' }, 4: { 'tribes': '1' }
                })
                done();
            })
        });
    });
});
