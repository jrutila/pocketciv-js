var should = require('chai').should()
var chai = require('chai')
require('mocha')
var _ = require('underscore')
var common = require('./common');

describe('Civil War', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var runEvent = common.runEvent;
    var state = {};
    state.map = {};
    beforeEach(function() {
        event = require('../../src/events/civil_war')
        //           5
        //          / \
        // 2 - 3 - 4 - 6
        state.map.areas = {
            6: { id: 6, tribes: 3, city: 3, neighbours: [ 4, 5 ]},
            5: { id: 5, tribes: 1, city: 2, neighbours: [ 4, 6 ]},
            4: { id: 4, tribes: 1, neighbours: [ 3, 5, 6 ]},
            3: { id: 3, tribes: 2, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 2, neighbours: [ 3 ] },
        }
    });
    it('should give collateral damage', function(d) {
        // Area: 6, collateral damage: 6
        deck.push({ circle: 6 }, { hex: 6 });
        reduce.push({ 6: { tribes: 0 }, 5: {tribes: 0}, 4: {tribes: 0}});
        done(function() {
            this.changes.should.deep.equal({
                "4": {
                  "tribes": -1
                },
                "5": {
                  "city": -2,
                  "tribes": -1
                },
                "6": {
                  "city": -2,
                  "tribes": -3
                }
            })
            d();
        });
        runEvent(event, {}, state);
    });
})