var should = require('chai').should()
require('mocha')
var common = require('./common');

describe('Expedition', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var action = require('../../src/actions/expedition')
    var state = { map: {}};
    beforeEach(function() {
        state.map.areas = {
            2: { tribes: 5, neighbours: [3, 'sea'] },
            3: { tribes: 6, neighbours: [2, 'frontier'] }
        };
    });
    describe('to frontier', function() {
        it('should work basic', function(done) {
            reduce.push({3: { tribes: 1 }});
            deck.push({hexagon:2});
            common.done(function() {
                this.changes.should.deep.equal({
                    3: {tribes:-5},
                    gold: 3
                })
                done();
            })
            common.runAction(action, state)
        });
    });
});
