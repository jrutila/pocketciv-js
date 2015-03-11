var should = require('chai').should()
var pocketciv = require('../src/core/pocketciv')
var event = require('../src/core/event')

describe('EventDeck', function() {
    describe('initialization', function() {
        beforeEach(function() {
            pocketciv.EventDeck.shuffle();
        });
        it('should create thirteen cards when shuffled', function() {
            pocketciv.EventDeck.cardsLeft.should.equal(13);
        });
        it('should return a different card when drawn', function() {
            var all = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
            var drawn = [];
            for (var i = 0; i < 12; i++)
            {
                var card = pocketciv.EventDeck.draw();
                card.id.should.be.within(1,16);
                drawn.should.not.include(card.id)
                drawn.push(card.id);
                pocketciv.EventDeck.cardsLeft.should.equal(12-i);
            }
        });
        it.skip('should throw NoMoreCards exception if all cards are drawn', function(done) {
            for (var i = 0; i < 13; i++)
            {
                pocketciv.EventDeck.draw();
            }
            try {
                pocketciv.EventDeck.draw();
                fail();
            } catch (ex) {
                done();
            }
            //pocketciv.EventDeck.draw().should.throw(pocketciv.NoMoreCardsError);
        });
    });
});

describe('Map', function() {
    describe('tribes', function() {
        describe('movement', function() {
            beforeEach(function() {
                pocketciv.Map.areas = {
                        1: {
                            'tribes': 2,
                            'neighbours': [2]
                        },
                        2: {
                            'tribes': 2,
                            'neighbours': [1,3]
                        },
                        3: {
                            'tribes': 2,
                            'neighbours': [2]
                        }
                };
            });
            it('should move tribes from area to another', function() {
                pocketciv.Map.moveTribes({ 1: 1, 2: 3, 3: 2 });
                pocketciv.Map.areas[1].tribes.should.equal(1);
                pocketciv.Map.areas[2].tribes.should.equal(3);
                pocketciv.Map.areas[3].tribes.should.equal(2);
            });
        });
        describe('changes', function() {
            beforeEach(function() {
                pocketciv.Map.areas = {
                        1: {
                            'tribes': 2,
                        },
                };
            });
            it('should remove a tribe from area', function() {
                pocketciv.Map.removeTribe(1);
                pocketciv.Map.areas[1].tribes.should.equal(1);
            });
            it('should add a tribe to area', function() {
                pocketciv.Map.addTribe(1); // Area: 1
                pocketciv.Map.areas[1].tribes.should.equal(3);
            });
            it('should remove multiple tribes from area', function() {
                pocketciv.Map.removeTribe(1, 2);
                pocketciv.Map.areas[1].tribes.should.equal(0);
            });
            it('should add multiple tribes to area', function() {
                pocketciv.Map.addTribe(1, 5); // Area: 1
                pocketciv.Map.areas[1].tribes.should.equal(7);
            });
        })
    });
    describe('tribeCount', function() {
      it('should count tribes from areas', function() {
        var target = pocketciv.Map;
        target.areas = {
          4: { 'tribes': 5 },
          3: { tribes: 0 },
          2: { tribes: 4 },
          1: { },
        }
        target.tribeCount.should.equal(9);
      });
    });
});

describe("Engine", function() {
    describe('populate', function() {
        beforeEach(function() {
            engine = pocketciv.Engine;
            engine.init({
                'era': 1
            });
            pocketciv.Map.areas = {
                    1: {
                        'tribes': 2,
                        'neighbours': [ 2, 3 ]
                    },
                    2: {
                        'tribes': 1,
                        'neighbours': [ 1, 3 ]
                    },
                    3: {
                        'tribes': 0,
                        'neighbours': [ 2, 1 ]
                    }
            };
            engine.areaChanger = function(changes, done)
            {
                done.call(engine);
            }
        });
        it.skip('should populate', function() {
            engine.nextPhase();
            engine.phase.should.equal("populate");
            engine.runPhase('populate');
            pocketciv.Map.areas[1].tribes.should.equal(3);
            pocketciv.Map.areas[2].tribes.should.equal(2);
            pocketciv.Map.areas[3].tribes.should.equal(0);
            engine.phase.should.equal("tothree");
            //engine.move();
            //engine.event();
            //engine.advance();
            //engine.upkeep();
        });
    });
    describe('move', function() {
        beforeEach(function() {
            engine = pocketciv.Engine;
            engine.init({
                'era': 1
            });
            pocketciv.Map.areas = {
                    1: {
                        'tribes': 2,
                        'neighbours': [ 2, 3 ]
                    },
                    2: {
                        'tribes': 1,
                        'neighbours': [ 1, 3 ]
                    },
                    3: {
                        'tribes': 0,
                        'neighbours': [ 2, 1 ]
                    }
            };
            engine.phase = "move";
        });
    });
});
