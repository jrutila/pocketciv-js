var should = require('chai').should();
var expect = require('chai').expect;
var pocketciv = require('../../src/core/pocketciv');
var ctx = require('../../src/core/context').Context;

describe("Context", function() {
    var engine;
    beforeEach(function() {
        engine = new pocketciv.EngineBuild();
        engine.gold = 10;
    });
    describe("should support wonders", function() {
        it("adding to empty", function() {
            engine.map.areas = {
                1: { tribes: 5 }
            }
            var trg = new ctx(engine);
            trg.change(1, { wonders: { '+': ['wond1'] }})
            trg.targets[1].should.deep.equal({
                tribes: 5, wonders: ['wond1']
            })
        });
        it("adding to existing", function() {
            engine.map.areas = {
                1: { tribes: 5, wonders: ['wond0'] }
            }
            var trg = new ctx(engine);
            trg.change(1, { wonders: { '+': ['wond1'] }})
            trg.targets[1].should.deep.equal({
                tribes: 5, wonders: ['wond0', 'wond1']
            })
        });
        it("remove from existing", function() {
            engine.map.areas = {
                1: { tribes: 5, wonders: ['wond1', 'wond2', 'wond3'] }
            }
            var trg = new ctx(engine);
            trg.change(1, { wonders: { '-': ['wond1','wond2'] }})
            trg.targets[1].should.deep.equal({
                tribes: 5, wonders: ['wond3']
            })
        });
        it("add and remove", function() {
            engine.map.areas = {
                1: { tribes: 5, wonders: ['wond1', 'wond2'] }
            }
            var trg = new ctx(engine);
            trg.change(1, { wonders: { '-': ['wond2'], '+': ['wond3'] }})
            trg.targets[1].should.deep.equal({
                tribes: 5, wonders: ['wond1','wond3']
            })
        });
        it("both and tribes", function() {
            engine.map.areas = {
                1: { tribes: 5, wonders: ['wond1', 'wond2'] }
            }
            var trg = new ctx(engine);
            trg.change(1, { wonders: { '-': ['wond2'], '+': ['wond3'] }})
            trg.change(1, { tribes: -2 });
            trg.targets[1].should.deep.equal({
                tribes: 3, wonders: ['wond1','wond3']
            })
        });
    })
});