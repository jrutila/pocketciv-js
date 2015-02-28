var should = require('chai').should()
require('mocha')
var common = require('./common');

describe('Visitation', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var runEvent = common.runEvent;
    beforeEach(function() {
        event = require('../../src/events/visitation')
    });
    describe('trade', function() {
        it('should go to trade if next card is friendly', function(d) {
            deck.push({ friendly: true });
            deck.push({ circle: 3 });
            done(function() {
                this.changes.should.deep.equal({
                    'gold': +3,
                });
                d();
            });
            runEvent(event, { visitor: 'nordic' });
        });
    });
    
    describe('attack', function() {
        var state = {};
        state.map = {};
        beforeEach(function() {
            // frontier| 3  |
            //         |/ \ /
            //     5 - 4   2
            //       |
            //            sea
            state.map.areas = {
                5: { id: 5, tribes: 2, neighbours: [ 4, 'frontier' ]},
                4: { id: 4, tribes: 3, neighbours: [ 3, 5, 'sea', 'frontier' ]},
                3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
                2: { id: 2, tribes: 5, neighbours: [ 3, 'sea' ] },
            }
        });
        it('should do the attack if next card is not friendly and area neighbours border', function(d) {
            deck.push({ friendly: false }, { circle: 5 }, { square: 3, hexagon: 6 });
            reduce.push([4]);
            done(function() {
                this.changes.should.deep.equal({
                5: { 'tribes': -2 }, 4: { 'tribes': -3 }
                })
                d();
            });
            runEvent(event, { visitor: 'nordic', expr: 's+h' }, state);
        });
        it('should stop the attack if next card is not friendly and area does not neighbour border', function(d) {
            deck.push({ friendly: false }, { circle: 3 }, { square: 3, hexagon: 6 });
            done(function() {
                this.changes.should.deep.equal({
                })
                d();
            });
            runEvent(event, { visitor: 'nordic', expr: 's+h' }, state);
        });
    });
});
