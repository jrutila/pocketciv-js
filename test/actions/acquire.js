var should = require('chai').should()
var pocketciv = require('../../src/core/pocketciv')
var acquire = require('../../src/actions/acquire')

describe("AdvanceAcquirer", function() {
    beforeEach(function() {
        engine = pocketciv.Engine;
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
    });
    it('should return empty advances', function() {
        engine.advances = {
            'adv1': { cost: { 'tribes': 100 } }, //already acquired
            'adv2': { cost: { 'tribes': 100 } }
        };
        acquirer = new acquire.AdvanceAcquirer(engine);
        
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': [] }
        });
    });
    it('should return possible advances with cities by tribes', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 }
            },
            'adv3': {
                cost: { 'tribes': 5 }
            }
        };
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': [] },
        });
    });
    it('should return advances with free cost', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 }
            },
            'adv3': {
                cost: { }
            }
        };
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1", "3"] },
        });
    });
    it('should return advances after acquire and deacquire', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 }
            },
            'adv3': {
                cost: { }
            }
        };
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1", "3"] },
        });
        acquirer.acquire('adv2', 1);
        acquirer.possibleAdvances.should.deep.equal({
            'adv3': { 'areas': ["3"] },
        });
        /*
        acquirer.deacquire('adv2');
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1", "3"] },
        });
        */
    });
    it('should follow the requirement tree', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 },
                requires: [ 'adv1' ]
            },
            'adv3': {
                cost: { },
                requires: [ 'adv2' ]
            },
            'adv4': {
                cost: { },
                requires: [ 'notexisting' ]
            }
        };
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
        });
        acquirer.acquire('adv2', 1);
        acquirer.possibleAdvances.should.deep.equal({
            'adv3': { 'areas': ["3"] },
        });
    });
    it('should follow the requirement tree with optional reqs', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 },
                requires: [ 'adv1' ]
            },
            'adv3': {  // Already acquired
                cost: { },
                requires: [ 'adv1' ]
            },
            'adv4': {
                cost: { },
                requires: [ [ 'adv1', 'adv2'], 'adv3' ]
            }
        };
        engine.acquired.push('adv3')
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv4': { 'areas': ["1","3"] },
        });
    });
    it('should return advances by resources', function() {
        engine.advances = {
            'adv1': { cost: { } }, // Already acquired
            'adv2': {
                cost: { 'tribes': 3 },
                resources: [ 'wood', 'food' ]
            },
            'adv3': {
                cost: { },
                resources: [ 'stone' ]
            }
        };
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1"] },
        });
        
    });
    it('should return advances by multiple resources', function() {
        engine.advances = {
            'adv2': {
                cost: {},
                resources: [ 'wood', 'stone' ]
            },
        };
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv2': { 'areas': ["1"] },
        });
        
    });
    it('should enable possibility to replace resources', function() {
        engine.advances = {
            'adv1': {
                cost: {},
                resources: [ 'stone' ]
            },
            'adv2': {
                cost: {},
                resources: [ 'wood', 'stone' ]
            },
            'adv3': {
                cost: {},
                resources: [ 'food' ]
            },
        };
        engine.params.replaceable_resources = ['wood', 'stone'];
        engine.acquired = [];
        acquirer = new acquire.AdvanceAcquirer(engine);
        acquirer.possibleAdvances.should.deep.equal({
            'adv1': { 'areas': ["1","3"] },
            'adv2': { 'areas': ["1"] },
            'adv3': { 'areas': ["1"] },
        });
        
    });
});