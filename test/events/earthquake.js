var should = require('chai').should()
var chai = require('chai');
require('mocha')
var _ = require('underscore')
var common = require('./common');

describe('Earthquake', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    //var done = common.done;
    var runEvent = common.runEvent;
    var state = {};
    state.map = {};
    beforeEach(function() {
        event = require('../../src/events/earthquake')
        //           5
        //          / \
        // 2 - 3 - 4 - 6
        deck.splice(0,deck.length);
        reduce.splice(0,reduce.length);
        state.map.areas = {
            6: { id: 6, tribes: 9, neighbours: [ 4, 5 ]},
            5: { id: 5, tribes: 2, neighbours: [ 4, 6 ]},
            4: { id: 4, tribes: 4, city: 8, fault: true, neighbours: [ 3, 5, 6 ]},
            3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, city: 2, fault: true, neighbours: [ 3 ] },
        }
    });
    it('should do basic if there is no fault', function(done) {
        deck.push({ circle: 6 });
        common.done(function() {
            this.changes.should.deep.equal({
                6: { 'tribes': -1 , 'fault': true }
            })
            done();
        })
        runEvent(event, { expr: 'h' }, state);
    });
    it('should ask for two more areas if there is fault', function(done) {
        deck.push({ circle: 4 }, { hexagon: 7 });
        reduce.push([5,6], {
            5: { 'tribes': 0 },
            6: { 'tribes': 4 },
        });
        
        common.done(function() {
            this.changes.should.deep.equal({
                6: { 'tribes': -5 , 'fault': true },
                4: { 'tribes': -4 , 'city': -3 },
                5: { 'tribes': -2 , 'fault': true }
            })
            done();
        });
        runEvent(event, { 'expr': 'h'}, state);
    });
    it('should only ask for one area if there is no more', function() {
        deck.push({ circle: 2 }, { hexagon: 7 });
        reduce.push([3], {
            2: { 'tribes': 0 },
        });
        
        common.done(function() {
            chai.assert.fail()
        });
        chai.assert.throws(function() {
            runEvent(event, { 'expr': 'h'}, state);
        })
    });
    it('should ask no areas if there is only faults', function(done) {
        state.map.areas[6].fault = true;
        state.map.areas[5].fault = true;
        state.map.areas[3].fault = true;
        deck.push({ circle: 4 }, { hexagon: 7 });
        reduce.push([], {
            6: { 'tribes': 4 },
            5: { 'tribes': 0 },
        });
        
        common.done(function() {
            this.changes.should.deep.equal({
                4: { 'tribes': -4, 'city': -3 },
                5: { 'tribes': -2 },
                6: { 'tribes': -5 }
            })
            done();
        });
        runEvent(event, { 'expr': 'h'}, state);
    });
})