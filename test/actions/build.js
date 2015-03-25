var should = require('chai').should()
var pocketciv = require('../../src/core/pocketciv')
var build = require('../../src/actions/build')

describe("WonderBuilderer", function() {
    beforeEach(function() {
        engine = pocketciv.Engine;
        engine.wonders = {
            'w1': { cost: { tribes: 4, gold: 10 } }
        }
        engine.map.areas = {
            1: {
                'city': 2,
                'tribes': 4,
                'mountain': true,
                'farm': true,
                'forest': true
            },
            2: {
                'city': 0,
                'tribes': 6,
            },
            3: {
                'city': 1,
                'forest': true,
            }
        }
        engine.acquired = ['adv1']
        engine.gold = 20;
    });
    it('should return empty advances', function() {
        engine.gold = 0;
        var target = new build.WonderBuilderer(engine);
        target.possibleWonders.should.deep.equal({ });
    });
    it('should return one advance', function() {
        var target = new build.WonderBuilderer(engine);
        target.possibleWonders.should.deep.equal({
            w1: { areas: ['1', '2'] }
            });
    });
});