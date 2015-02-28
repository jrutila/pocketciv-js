var should = require('chai').should()
require('mocha')
var _ = require('underscore')
var common = require('./common');

describe('Corruption', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var runEvent = common.runEvent;
    var state = {};
    state.map = {};
    beforeEach(function() {
        deck.splice(0,deck.length);
        reduce.splice(0,reduce.length);
        event = require('../../src/events/corruption')
        //           5
        //          / \
        // 2 - 3 - 4 - 6
        state.map.areas = {
            6: { id: 6, tribes: 9, neighbours: [ 4, 5 ]},
            5: { id: 5, tribes: 2, neighbours: [ 4, 6 ]},
            4: { id: 4, tribes: 4, city: 8, fault: true, neighbours: [ 3, 5, 6 ]},
            3: { id: 3, tribes:-1, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, city: 2, fault: true, neighbours: [ 3 ] },
        }
        state.gold = 10;
    });
    it('should do basic city reduce', function(done) {
        deck.push({ circle: 6 });
        reduce.push({ 4: { 'city': 2 }}); // 8 - 6 = 2
        common.done(function() {
            this.changes.should.deep.equal({
                4: { 'city': -6 },
                'gold': -10
            })
            done();
        });
        runEvent(event, { expr: 'c' }, state);
    });
    it('should settle for all cities', function(done) {
        state.map.areas[4].city = 1;
        deck.push({ circle: 6 });
        reduce.push({ 4: { 'city': 0 }, 2: { 'city': 0 }});
        common.done(function() {
            this.changes.should.deep.equal({
                4: { 'city': -1 },
                2: { 'city': -2 },
                'gold': -10
            })
            done();
        })
        runEvent(event, { expr: 'c' }, state);
    });
})