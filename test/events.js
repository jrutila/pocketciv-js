var should = require('chai').should()
var eventRunner = require('../event')
var pocketciv = require('../pocketciv')

describe('Famine', function() {
    beforeEach(function() {
        runEvent = eventRunner.runEvent;
        event = require('../events/famine')
        engine = pocketciv.Engine;
        engine.map.areas = { 5: { id: 5} }
        engine.drawer = function(deck, done) { done({ 'circle': 5}) }
    })
    it('should cause tribes to zero, no farms and city -2', function(done) {
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({ 5: {'tribes': '0', 'farm': false, 'city': '-2'}})
            done();
        })
    });
});

describe.only('Flood', function() {
    beforeEach(function() {
        runEvent = eventRunner.runEvent;
        event = require('../events/flood')
        engine = pocketciv.Engine;
        engine.map.areas = { 
            5: { id: 5, neighbours: [ 4, 'sea' ]},
            4: { id: 4, neighbours: [ 3, 5, 'sea' ]},
            3: { id: 3, neighbours: [ 4, 2 ] },
            2: { id: 2, neighbours: [ 3, 'sea' ] },
        }
        engine.drawer = function(deck, done) { done({ 'circle': 5}) }
    })
    it('should be a flood if not next to sea', function(done) {
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({ 5: {'tribes': '0', 'farm': false, 'city': '-2'}})
            done();
        })
    });
    
})