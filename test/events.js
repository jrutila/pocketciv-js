var should = require('chai').should()
require('mocha')
var eventRunner = require('../core/event')
var pocketciv = require('../core/pocketciv')

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

describe('Flood', function() {
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

describe('Epidemic', function() {
    beforeEach(function() {
        runEvent = eventRunner.runEvent;
        event = require('../events/epidemic')
        engine = pocketciv.Engine;
        engine.map.areas = {
            5: { id: 5, tribes: 2, neighbours: [ 4 ]},
            4: { id: 4, tribes: 3, neighbours: [ 3, 5 ]},
            3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
            2: { id: 2, tribes: 5, neighbours: [ 3 ] },
        }
    });
    it('should expand to other areas from 5', function(done) {
        var deckk = [{ circle: 5 }, { square: 5 }]
        var areaa = [ 4 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
            })
            done();
        })
    });
    it('should expand to other areas from 5 using only tribes', function(done) {
        var deckk = [{ circle: 5 }, { square: 4 }]
        var areaa = [ 4 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '1' },
            })
            done();
        })
    });
    it('should stop to area 3', function(done) {
        var deckk = [{ circle: 5 }, { square: 6 }]
        var areaa = [ 4, 2 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
            })
            done();
        })
    });
    it('should go on to area 2', function(done) {
        engine.map.areas[3].tribes = 3
        var deckk = [{ circle: 5 }, { square: 7 }]
        var areaa = [ 4, 3 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
                3: {'tribes': '1' },
            })
            done();
        })
    });
    it('should stop to area 5 when starting from 4', function(done) {
        engine.map.areas[3].tribes = 3
        var deckk = [{ circle: 4 }, { square: 8 }]
        var areaa = [ 5, 2 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                5: {'tribes': '0' },
                4: {'tribes': '0' },
            })
            done();
        })
    });
    it('should stop to area 3 when starting from 4', function(done) {
        var deckk = [{ circle: 4 }, { square: 8 }]
        var areaa = [ 4, 2 ];
        engine.drawer = function(deck, done) { done(deckk.shift()) }
        engine.selector = function(areas, done) {
          done(areas[areaa.shift()]);
        }
        runEvent(engine, event, { expr: 's' }, function(chg) {
            chg.should.deep.equal({
                4: {'tribes': '0' },
            })
            done();
        })
    });
})

describe('Visitation', function() {
    beforeEach(function() {
        deck = [];
        runEvent = eventRunner.runEvent;
        event = require('../events/visitation')
        engine = pocketciv.Engine;
        engine.drawer = function(d, done) { done(deck.shift()) }
    });
    describe('trade', function() {
        it('should go to trade if next card is friendly', function(done) {
            deck = [{ friendly: true }, { circle: 3 }]
            runEvent(engine, event, { visitor: 'nordic' }, function(chg) {
                chg.should.deep.equal({
                    'gold': '+3',
                })
                done();
            })
        });
    });
    describe('attack', function() {
        beforeEach(function() {
            engine.map.areas = {
                5: { id: 5, tribes: 2, neighbours: [ 4, 'frontier' ]},
                4: { id: 4, tribes: 3, neighbours: [ 3, 5, 'sea', 'frontier' ]},
                3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
                2: { id: 2, tribes: 5, neighbours: [ 3, 'sea' ] },
            }
        });
        it('should stop the attack if next card is not friendly and area does not neighbour border', function(done) {
            deck = [{ friendly: false }, { circle: 3 }, { square: 3, hexagon: 6 }]
            runEvent(engine, event, { visitor: 'nordic', expr: 's+h' }, function(chg) {
                chg.should.deep.equal({})
                done();
            })
        });
        it('should do the attack if next card is not friendly and area neighbours border', function(done) {
            deck = [{ friendly: false }, { circle: 5 }, { square: 3, hexagon: 6 }]
            engine.reducer = function(reducer, done) {
                reducer.startRegion.id.should.equal(5)
                reducer.startAmount.should.equal(9)
                done({
                5: { 'tribes': '0' }, 4: { 'tribes': '1' }
                });
            }
            runEvent(engine, event, { visitor: 'nordic', expr: 's+h' }, function(chg) {
                chg.should.deep.equal({
                5: { 'tribes': '0' }, 4: { 'tribes': '1' }
                })
                done();
            })
        });
    });
});
