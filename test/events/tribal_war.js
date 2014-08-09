var should = require('chai').should()
require('mocha')
var eventRunner = require('../../core/event')
var pocketciv = require('../../core/pocketciv')
var _ = require('underscore')

describe('Tribal War', function() {
    beforeEach(function() {
        deck = [];
        runEvent = eventRunner.runEvent;
        event = require('../../events/tribal_war')
        engine = pocketciv.Engine;
        //           5
        //          / \
        // 2 - 3 - 4 - 6
        engine.map.areas = {
            6: { id: 6, tribes: 9, neighbours: [ 4, 5 ]},
            5: { id: 5, tribes: 2, neighbours: [ 4, 6 ]},
            4: { id: 4, tribes: 4, neighbours: [ 3, 5, 6 ]},
            3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, neighbours: [ 3 ] },
        }
        engine.drawer = function(d, done) { done(deck.shift()) }
    });
    it('should stop if there is no tribes', function(done) {
        deck = [{ circle: 3 }]
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({
            })
            done();
        })
    });
    it('should let choose 5 and 6 when starting from 4', function(done) {
        deck = [{ circle: 4 }]
        engine.reducer = function(rdc, done) {
            rdc.startAmount.should.equal(8);
            _.keys(rdc.ok([]).areas).should.deep.equal([ '5', '6' ])
            done(rdc.ok([5, 6]).changes)
        }
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({
                6: {'tribes': '-8' },
                5: {'tribes': '-8' },
                4: {'tribes': '-3' },
            })
            done();
        })
    });
    it('should let choose 3 and 5 when starting from 4', function(done) {
        engine.map.areas[3].tribes = 2;
        deck = [{ circle: 4 }]
        engine.reducer = function(rdc, done) {
            rdc.startAmount.should.equal(8);
            _.keys(rdc.ok([]).areas).should.deep.equal([ '3', '5', '6' ])
            done(rdc.ok([3, 5]).changes)
        }
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({
                3: {'tribes': '-8' },
                5: {'tribes': '-8' },
                4: {'tribes': '-3' },
            })
            done();
        })
    });
    it('should not let do invalid choices', function(done) {
        deck = [{ circle: 4 }]
        engine.map.areas[3].tribes = 2;
        engine.reducer = function(rdc, done) {
            rdc.startAmount.should.equal(8);
            _.keys(rdc.ok([]).areas).should.deep.equal([ '3', '5', '6' ])
            rdc.ok([ 2 ]).should.equal(false);
            rdc.ok([ 3, 5, 6 ]).should.equal(false);
            done(rdc.ok([5, 6]).changes)
        }
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({
                6: {'tribes': '-8' },
                5: {'tribes': '-8' },
                4: {'tribes': '-3' },
            })
            done();
        })
    });
    it('should let choose only one neighbour', function(done) {
        deck = [{ circle: 4 }]
        engine.map.areas[6].tribes = 0;
        engine.reducer = function(rdc, done) {
            rdc.startAmount.should.equal(8);
            _.keys(rdc.ok([]).areas).should.deep.equal([ '5' ])
            done(rdc.ok([ 5 ]).changes)
        }
        runEvent(engine, event, {}, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '-8' },
                4: {'tribes': '-3' },
            })
            done();
        })
    });
})