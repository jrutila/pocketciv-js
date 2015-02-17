var should = require('chai').should()
require('mocha')
var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var _ = require('underscore')

describe('Earthquake', function() {
    beforeEach(function() {
        deck = [];
        reduces = [];
        runEvent = eventRunner.runEvent;
        event = require('../../src/events/earthquake')
        engine = pocketciv.Engine;
        //           5
        //          / \
        // 2 - 3 - 4 - 6
        engine.map.areas = {
            6: { id: 6, tribes: 9, neighbours: [ 4, 5 ]},
            5: { id: 5, tribes: 2, neighbours: [ 4, 6 ]},
            4: { id: 4, tribes: 4, city: 8, fault: true, neighbours: [ 3, 5, 6 ]},
            3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, city: 2, fault: true, neighbours: [ 3 ] },
        }
        engine.drawer = function(d, done) { done(deck.shift()) }
        engine.reducer = function(reducer, done) {
            done(reducer.ok(reduces.shift()).changes);
        }
        
    });
    it('should do basic if there is no fault', function(done) {
        deck = [{ circle: 6 }]
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({
                6: { 'tribes': '-1' , 'city': '-1', 'fault': true }
            })
            done();
        })
    });
    it('should ask for two more areas if there is fault', function(done) {
        deck = [{ circle: 4 }, { hexagon: 7 }]
        reduces = [[5,6], {
            5: { 'tribes': -2 },
            6: { 'tribes': -5 },
        }]
        
        runEvent(engine, event, { 'expr': 'h'}, function(chg) {
            chg.should.deep.equal({
                6: { 'tribes': '-5' , 'fault': true },
                4: { 'tribes': '-4' , 'city': '-3' },
                5: { 'tribes': '-2' , 'fault': true }
            })
            done();
        })
    });
    it('should only ask for one area if there is no more', function(done) {
        deck = [{ circle: 2 }, { hexagon: 7 }]
        reduces = [[3], {
            2: { 'tribes': -1 },
        }]
        
        runEvent(engine, event, { 'expr': 'h'}, function(chg) {
            chg.should.deep.equal({
                2: { 'tribes': '-5', 'city': '-3' },
                3: { 'fault': true }
            })
            done();
        })
    });
    it('should ask no areas if there is only faults', function(done) {
        engine.map.areas[6].fault = true;
        engine.map.areas[5].fault = true;
        engine.map.areas[3].fault = true;
        deck = [{ circle: 4 }, { hexagon: 7 }]
        reduces = [[], {
            6: { 'tribes': -5 },
            5: { 'tribes': -2 },
        }]
        
        runEvent(engine, event, { 'expr': 'h'}, function(chg) {
            chg.should.deep.equal({
                4: { 'tribes': '-4', 'city': '-3' },
                5: { 'tribes': '-2' },
                6: { 'tribes': '-5' }
            })
            done();
        })
    });
})