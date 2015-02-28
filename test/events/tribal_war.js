var should = require('chai').should()
var chai = require('chai')
require('mocha')
var _ = require('underscore')
var common = require('./common');

describe('Tribal War', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var runEvent = common.runEvent;
    var state = {};
    state.map = {};
    beforeEach(function() {
        event = require('../../src/events/tribal_war')
        //           5
        //          / \
        // 2 - 3 - 4 - 6
        state.map.areas = {
            6: { id: 6, tribes: 9, neighbours: [ 4, 5 ]},
            5: { id: 5, tribes: 2, neighbours: [ 4, 6 ]},
            4: { id: 4, tribes: 4, neighbours: [ 3, 5, 6 ]},
            3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, neighbours: [ 3 ] },
        }
    });
    it('should stop if there is no tribes', function(d) {
        deck.push({ circle: 3 });
        done(function() {
            this.changes.should.deep.equal({
            })
            d();
        });
        runEvent(event, {}, state);
    });
    it('should let choose 5 and 6 when starting from 4', function(d) {
        deck.push({ circle: 4 });
        reduce.push([5,6]);
        done(function() {
            this.changes.should.deep.equal({
                6: {'tribes': -8 },
                5: {'tribes': -2 },
                4: {'tribes': -3 },
            })
            d();
        });
        runEvent(event, {}, state);
    });
    it('should let choose 3 and 5 when starting from 4', function(d) {
        state.map.areas[3].tribes = 2;
        deck.push({ circle: 4 });
        reduce.push([3,5]);
        done(function() {
            this.changes.should.deep.equal({
                3: {'tribes': -2 },
                5: {'tribes': -2 },
                4: {'tribes': -3 },
            })
            d();
        });
        runEvent(event, {}, state);
    });
    it('should not let do invalid choices', function() {
        state.map.areas[3].tribes = 2;
        deck.push({ circle: 4 });
        reduce.push([3,5,6]);
        done(function() {
        });
        chai.assert.throws(function() {
            runEvent(event, {}, state);
        });
    });
    it('should let choose only one neighbour', function(d) {
        state.map.areas[6].tribes = 0;
        deck.push({ circle: 4 });
        reduce.push([5]);
        done(function() {
            this.changes.should.deep.equal({
                5: {'tribes': -2 },
                4: {'tribes': -3 },
            })
            d();
        });
        runEvent(event, {}, state);
    });
})