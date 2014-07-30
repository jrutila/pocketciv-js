var should = require('chai').should()
require('mocha')
var eventRunner = require('../../core/event')
var pocketciv = require('../../core/pocketciv')

describe('Famine', function() {
    beforeEach(function() {
        runEvent = eventRunner.runEvent;
        event = require('../../events/famine')
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