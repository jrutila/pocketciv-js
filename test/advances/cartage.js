var should = require('chai').should()
var cartage = require('../../src/advances/cartage')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

describe('Cartage', function() {
    describe('city_support.post', function() {
        beforeEach(function() {
            engine = pocketciv.Engine;
        })
        it('should skip if there is farm per city', function() {
            engine.map.areas = {
                1: { farm: true, city: 2 },
                2: { city: 2 },
                3: { farm: true, tribes: 2 }
            }
            
            var ctx = new PhaseContext(engine);
            ctx.changes = { 2: { 'city': '-1' } }
            cartage.phases["city_support.post"].call(engine, ctx);
            
            ctx.changes.should.deep.equal({});
        })
        it('should give reducer if there is not enough farms', function(done) {
            engine.map.areas = {
                1: { farm: true, city: 2 },
                2: { city: 2 },
                3: { tribes: 2 }
            };
            
            engine.reducer = function(rdc, d) {
                d(rdc.ok([1]));
            }
            
            var ctx = new PhaseContext(engine);
            ctx.done = function() {
                ctx.changes.should.deep.equal({ 1: { 'city': -1 }});
                done();
            }
            cartage.phases["city_support.post"].call(engine, ctx);
        })
    })
})