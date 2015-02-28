var should = require('chai').should()
require('mocha')
var common = require('./common');

describe('Flood', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var runEvent = common.runEvent;
    var state = {};
    state.map = {};
    beforeEach(function() {
        event = require('../../src/events/flood')
        // 5 - 4 - 3
        // sea    /
        //       2
        state.map.areas = {
            5: { id: 5, neighbours: [ 4, 'sea' ]},
            4: { id: 4, neighbours: [ 3, 5, 'sea' ]},
            3: { id: 3, tribes: 4, farm: true, city: 2, neighbours: [ 4, 2 ] },
            2: { id: 2, neighbours: [ 3, 'sea' ] },
        }
    })
    it('should be a flood if not next to sea', function(d) {
        deck.push({ 'circle': 3});
        done(function() {
            this.changes.should.deep.equal({ 3: {'tribes': -2, 'farm': false, 'city': -1, 'forest': true}});
            d();
        });
        runEvent(event, { expr: 's' }, state);
    });
    it('should be a TSUNAMI if next to sea', function(d) {
        state.map.areas[5].tribes = 4;
        state.map.areas[5].city = 4;
        state.map.areas[4].tribes = 5;
        state.map.areas[4].city = 5;
        
        deck.push({ circle: 5 }, { square: 7 });
        done(function() {
            this.changes.should.deep.equal({
                5: {'tribes': -4, 'city': -2 },
                4: {'tribes': -5, 'city': -1 },
                });
            d();
        });
        runEvent(event, { expr: 's' }, state);
    });
    it('tsunami case 1', function(d) {
        state.map.areas[5].tribes = 4;
        state.map.areas[5].city = 4;
        state.map.areas[4].tribes = 5;
        state.map.areas[4].city = 5;
        
        deck.push({ circle: 5 }, { square: 4 });
        done(function() {
            this.changes.should.deep.equal({
                5: {'tribes': -4 },
                4: {'tribes': -4 },
                });
            d();
        });
        runEvent(event, { expr: 's' }, state);
    });
    it('tsunami case 2', function(d) {
        state.map.areas[5].tribes = 4;
        state.map.areas[5].city = 4;
        state.map.areas[4].tribes = 0;
        state.map.areas[4].city = 5;
        
        deck.push({ circle: 5 }, { square: 5 });
        done(function() {
            this.changes.should.deep.equal({
                5: {'tribes': -4, 'city': -1 },
                4: {'city': -3 },
                });
            d();
        });
        runEvent(event, { expr: 's' }, state);
    });
})