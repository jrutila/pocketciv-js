var should = require('chai').should()
require('mocha')
var eventRunner = require('../../core/event')
var pocketciv = require('../../core/pocketciv')

describe('Flood', function() {
    beforeEach(function() {
        runEvent = eventRunner.runEvent;
        event = require('../../events/flood')
        engine = pocketciv.Engine;
        engine.map.areas = {
            5: { id: 5, neighbours: [ 4, 'sea' ]},
            4: { id: 4, neighbours: [ 3, 5, 'sea' ]},
            3: { id: 3, neighbours: [ 4, 2 ] },
            2: { id: 2, neighbours: [ 3, 'sea' ] },
        }
    })
    it('should be a flood if not next to sea', function(done) {
        engine.drawer = function(deck, done) { done({ 'circle': 3}) }
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({ 3: {'tribes': '-2', 'farm': false, 'city': '-1', 'forest': true}})
            done();
        })
    });
    it('should be a TSUNAMI if next to sea', function(done) {
        engine.map.areas[5].tribes = 4;
        engine.map.areas[5].city = 4;
        engine.map.areas[4].tribes = 5;
        engine.map.areas[4].city = 5;
        
        var deckk = [{ circle: 5 }, { square: 7 }]
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0', 'city': '2' },
                4: {'tribes': '0', 'city': '4' },
            })
            done();
        })
    });
    it('tsunami case 1', function(done) {
        engine.map.areas[5].tribes = 4;
        engine.map.areas[5].city = 4;
        engine.map.areas[4].tribes = 5;
        engine.map.areas[4].city = 5;
        
        var deckk = [{ circle: 5 }, { square: 4 }]
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '1' },
            })
            done();
        })
    });
    it('tsunami case 2', function(done) {
        engine.map.areas[5].tribes = 4;
        engine.map.areas[5].city = 4;
        engine.map.areas[4].tribes = 0;
        engine.map.areas[4].city = 5;
        
        var deckk = [{ circle: 5 }, { square: 5 }]
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0', 'city': '3' },
                4: {'city': '2' },
            })
            done();
        })
    });
})