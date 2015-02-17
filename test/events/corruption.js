var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var _ = require('underscore')

describe('Corruption', function() {
    beforeEach(function() {
        deck = [];
        reduces = [];
        runEvent = eventRunner.runEvent;
        event = require('../../src/events/corruption')
        engine = pocketciv.Engine;
        //           5
        //          / \
        // 2 - 3 - 4 - 6
        engine.map.areas = {
            6: { id: 6, tribes: 9, neighbours: [ 4, 5 ]},
            5: { id: 5, tribes: 2, neighbours: [ 4, 6 ]},
            4: { id: 4, tribes: 4, city: 8, fault: true, neighbours: [ 3, 5, 6 ]},
            3: { id: 3, tribes:-1, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, city: 2, fault: true, neighbours: [ 3 ] },
        }
        engine.drawer = function(d, done) { done(deck.shift()) }
        engine.reducer = function(reducer, done) {
            var rdc = reducer.ok(reduces.shift());
            console.log(rdc)
            rdc.ok.should.be.true;
            done(rdc.changes);
        }
    });
    it('should do basic city reduce', function(done) {
        deck = [{ circle: 6 }];
        reduces = [{ 4: { 'city': '-6' }}];
        runEvent(engine, event, { expr: 'c' }, function(chg) {
            chg.should.deep.equal({
                4: { 'city': '-6' },
                'gold': "0"
            })
            done();
        })
    });
    it('should settle for all cities', function(done) {
        engine.map.areas[4].city = 1;
        deck = [{ circle: 6 }];
        reduces = [{ 4: { 'city': '-1' }, 2: { 'city': '-2'}}];
        runEvent(engine, event, { expr: 'c' }, function(chg) {
            chg.should.deep.equal({
                4: { 'city': '-1' },
                2: { 'city': '-2' },
                'gold': "0"
            })
            done();
        })
    });
})