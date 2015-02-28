var should = require('chai').should()
require('mocha')
var common = require('./common');

describe('Farm', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var action = require('../../src/actions/farm')
    var state = { map: {}};
    beforeEach(function() {
        state.map.areas = {
            2: { tribes: 5, forest: true, neighbours: [3, 'sea'] },
            3: { tribes: 4, neighbours: [2, 'frontier'] }
        };
    });
    describe('basic case', function() {
        it('should work', function() {
            reduce.push({2: { tribes: 3 }});
            common.done(function() {
                this.changes.should.deep.equal({
                    2: {tribes:-2,forest:false,farm:true}
                })
            })
            common.runAction(action, state)
        });
    });
});
