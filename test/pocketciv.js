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
        it('should throw NoMoreCards exception if all cards are drawn', function(done) {
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
        it('should populate', function() {
            engine.nextPhase();
            engine.phase.should.equal("populate");
            engine.runPhase('populate');
            pocketciv.Map.areas[1].tribes.should.equal(3);
            pocketciv.Map.areas[2].tribes.should.equal(2);
            pocketciv.Map.areas[3].tribes.should.equal(0);
            engine.phase.should.equal("move");
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
        it('should call mover', function() {
            engine.mover = function(situation, move) {
                situation[1].tribes.should.equal(2);
                situation[2].tribes.should.equal(1);
                move.call(engine, { 1: 1, 2: 2, 3: 0});
            }
            engine.phase.should.equal("move");
            engine.move(function () {
                pocketciv.Map.areas[1].tribes.should.equal(1);
                pocketciv.Map.areas[2].tribes.should.equal(2);
                pocketciv.Map.areas[3].tribes.should.equal(0);
                engine.phase.should.equal("event");
            });
        });
    });
});

describe('EventRunner', function() {
    beforeEach(function() {
        engine = pocketciv.Engine;
        runner = event.runEvent;
        engine.map.areas = {
            5: { id: 5 }
        }
    });
    describe('steps', function() {
        beforeEach(function() {
            engine.acquired = {}
        });
        it('should go through steps', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 5 %}",
                    '2': "{% change({ 'tribes': '-1' }) %}"
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should merge the context', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 10 %}",
                    '2': "{% run() %}",
                }
                this.run = function() {
                    this.active_region = 5;
                    this.change({ 'tribes': '-2'})
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-2'}});
                done();
            });
        });
        it('should be able to use engine', function(done) {
            var ev = new function()
            {
                engine.gold = 5;
                this.steps = {
                    '1': "{% active_region = engine.gold %}",
                    '2': "{% change({ 'tribes': '-1' }) %}"
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should break if', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 5 %}",
                    '2': "{% change({ 'tribes': '-1' }) %}",
                    '3': "{% break_if(active_region == 5) %}",
                    '4': "{% change({ 'tribes': '-5' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should support variables', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% var variable = 3 %}",
                    '2': "{% variable = 5 %}",
                    '3': "{% active_region = variable %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should sort the steps', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1.2': "{% active_region = 5 %}",
                    '1.1': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should merge the advance steps', function(done) {
            var ev = new function()
            {
                this.name = "event1";
                this.steps = {
                    '1.2': "{% active_region = 4 %}",
                    '1.1': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            engine.advances = {
                'adv1': {
                    'events': {
                        'event1': {
                            'steps': {
                                '2': "{% active_region = 5 %}",
                            }
                        }
                    }
                }
            }
            engine.acquired = ['adv1']
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should support goto clause', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1.1': "{% active_region = 5 %}",
                    '1.2': "{% if (active_region == 5) goto('4') %}",
                    '1.3': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should support final clause', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1.1': "{% active_region = 5 %}",
                    '1.2': "{% break_if(active_region == 5) %}",
                    '1.3': "{% active_region = 3 %}",
                    'final': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
            
        })
    });
    it('should have area_card function', function(done) {
        engine.drawer = function(deck, done)
        {
            done({ 'circle': 5 });
        }
        engine.acquired = {}
        var ev = new function()
        {
            this.steps = {
                // {%; means that the step will call done by itself
                '1': "{%; area_card() %}",
                '4': "{% change({ 'tribes': '-1' }) %}",
            }
            return this;
        }();
        runner(engine, ev, {}, function(changes) {
            changes.should.deep.equal({ 5: { 'tribes': '-1'}});
            done();
        });
    });
})
