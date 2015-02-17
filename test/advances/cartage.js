var should = require('chai').should()
var cartage = require('../../src/advances/cartage')
var pocketciv = require('../../src/core/pocketciv')

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
            
            var ctx = Object();
            ctx.changes = { 2: { 'city': '-1' } }
            console.log(cartage)
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
                d({ 2: { 'city': '-1' }})
            }
            
            var ctx = Object();
            ctx.changes = { 2: { 'city': '-1' } }
            ctx.done = function() {
                ctx.changes.should.deep.equal({ 2: { 'city': '-1' }});
                done();
            }
            cartage.phases["city_support.post"].call(engine, ctx);
        })
        it('should give reducer if there is not enough farms and ui reduction', function(done) {
            engine.map.areas = {
                1: { id: 1, farm: true, city: 2 },
                2: { id: 2, city: 2 },
                3: { id: 3, tribes: 2 }
            };
            
            engine.reducer = function(rdc, d) {
                var ok = rdc.ok({
                    1: { 'city': 0, 'tribes': NaN },
                    2: { 'city': 0, 'tribes': 0 },
                    3: { 'city': NaN, 'tribes': 0 }
                });
                ok.should.be.false;
                ok = rdc.ok({
                    1: { 'city': 0, 'tribes': NaN },
                    2: { 'city': 0, 'tribes': 0 },
                });
                ok.changes.should.deep.equal({})
                done();
            }
            
            var ctx = Object();
            ctx.changes = { 2: { 'city': '-1' } }
            ctx.done = function() {
                ctx.changes.should.deep.equal({ 1: { 'city': '-1' }});
                done();
            }
            cartage.phases["city_support.post"].call(engine, ctx);
        })
    })
})