var should = require('chai').should()
var target = require('../../src/advances/navigation')
var pocketciv = require('../../src/core/pocketciv')

/*
OBSOLETE (I Guess?)
describe('Navigation', function() {
    describe('move.post', function() {
        beforeEach(function() {
            engine = pocketciv.Engine;
            //       1 - 2
            //         |    WEST   
            //  EAST   |
            //         \---3 - 5------
            //          \ /           FRONTIER
            //       6 - 4        
            reduction = {};
            ctx = Object();
            map = {
                1: { 'neighbours': [2, 'east' ] },
                2: { 'neighbours': [1, 'west' ] },
                3: { 'neighbours': [5, 4, 'west', 'frontier'] },
                4: { 'neighbours': [3, 6, 'east', 'frontier'] },
                5: { 'neighbours': [3, 'west', 'frontier'] },
                6: { 'neighbours': [4, 'east' ] },
            }
            engine.map.areas = map;
        });
        it('move can be skipped', function(done) {
            engine.map.areas[6].tribes = 3;
            engine.params.sea_move_cost = 0;
            engine.reducer = function(rdc, d) {
                var ok = rdc.ok(reduction);
                ok.ok.should.be.true;
                done();
            }
            target.phases["move.post"].call(engine, ctx);
        });
        it('can move between same sea', function(done) {
            engine.map.areas[6].tribes = 3;
            engine.params.sea_move_cost = 0;
            reduction = { 6: { 'tribes': -2 }, 1: { 'tribes': 2 }};
            var dd = [done, function() { }];
            engine.reducer = function(rdc, d) {
                var ok = rdc.ok(reduction);
                ok.should.not.be.false;
                ok.ok.should.be.true;
                ok.amount.should.equal(0);
                dd.pop()();
            }
            target.phases["move.post"].call(engine, ctx);
            reduction = { 1: { 'tribes': 2 }, 6: { 'tribes': -2 }};
            target.phases["move.post"].call(engine, ctx);
        });
        it("can't move between different seas", function(done) {
            engine.map.areas[6].tribes = 3;
            engine.params.sea_move_cost = 0;
            reduction = { 6: { 'tribes': -2 }, 2: { 'tribes': 2 }};
            engine.reducer = function(rdc, d) {
                var ok = rdc.ok(reduction);
                ok.should.be.false;
                done();
            }
            target.phases["move.post"].call(engine, ctx);
        });
        it("can't have two targets", function(done) {
            engine.map.areas[6].tribes = 3;
            engine.params.sea_move_cost = 0;
            reduction = { 6: { 'tribes': -2 }, 1: { 'tribes': 1 }, 4: { 'tribes': 1 }};
            engine.reducer = function(rdc, d) {
                var ok = rdc.ok(reduction);
                ok.should.be.false;
                done();
            }
            target.phases["move.post"].call(engine, ctx);
        });
        it("can't have two sources", function(done) {
            engine.map.areas[6].tribes = 3;
            engine.map.areas[4].tribes = 3;
            engine.params.sea_move_cost = 0;
            reduction = { 6: { 'tribes': -2 }, 4: { 'tribes': -2 }, 1: { 'tribes': 4 }};
            engine.reducer = function(rdc, d) {
                var ok = rdc.ok(reduction);
                ok.should.be.false;
                done();
            }
            target.phases["move.post"].call(engine, ctx);
        });
        it("moving costs one tribe", function(done) {
            engine.map.areas[6].tribes = 3;
            engine.params.sea_move_cost = 1;
            reduction = { 6: { 'tribes': -2 }, 1: { 'tribes': 1 } };
            engine.reducer = function(rdc, d) {
                var ok = rdc.ok(reduction);
                ok.should.not.be.false;
                ok.amount.should.equal(0);
                ok.ok.should.be.true;
                done();
            }
            target.phases["move.post"].call(engine, ctx);
        });
    })
})
*/