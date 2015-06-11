var should = require('chai').should()
var chai = require('chai');
require('mocha');
var common = require('./common');

describe.only('Epidemic', function() {
    var deck = common.deck;
    var reduce = common.reduce;
    var done = common.done;
    var notok = common.notok;
    var runEvent = common.runEvent;
    var state = {};
    state.map = {};
    describe("in basic case", function() {
        beforeEach(function() {
            event = require('../../src/events/epidemic')
            // 5 - 4 - 3 - 2
            state.map.areas = {
                5: { id: 5, tribes: 2, neighbours: [ 4 ]},
                4: { id: 4, tribes: 3, neighbours: [ 3, 5 ]},
                3: { id: 3, tribes: 0, neighbours: [ 4, 2 ] },
                2: { id: 2, tribes: 5, neighbours: [ 3 ] },
            }
        });
        it('should expand to other areas from 5', function(d) {
            deck.push({ circle: 5 }, { square: 5 });
            reduce.push([ 4 ]);
            done(function() {
                this.changes.should.deep.equal({
                    5: {'tribes': -2 },
                    4: {'tribes': -3 },
                });
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
        it('should expand to other areas from 5 using only tribes', function(d) {
            deck.push({ circle: 5 }, { square: 4 });
            reduce.push([ 4 ]);
            done(function() {
                this.changes.should.deep.equal({
                    5: {'tribes': -2 },
                    4: {'tribes': -2 },
                });
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
        it('should go on to area 2', function(d) {
            state.map.areas[3].tribes = 3
            deck.push({ circle: 5 }, { square: 7 });
            reduce.push([ 4, 3 ]);
            done(function() {
                this.changes.should.deep.equal({
                    5: {'tribes': -2 },
                    4: {'tribes': -3 },
                    3: {'tribes': -2 },
                })
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
        it('should stop to area 5 when starting from 4', function(d) {
            state.map.areas[3].tribes = 3
            deck.push({ circle: 4 }, { square: 8 });
            reduce.push([ 5 ]);
            done(function() {
                this.changes.should.deep.equal({
                    5: {'tribes': -2 },
                    4: {'tribes': -3 },
                })
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
        it('should stop to area 3 when starting from 4', function(d) {
            deck.push({ circle: 4 }, { square: 8 });
            done(function() {
                chai.assert.fail();
                d();
            });
            chai.assert.throws(function() {
                runEvent(event, { expr: 's' }, state);
                }
            );
            d();
        });
        it('should stop when there is only 2 tribes left', function(d) {
            state.map.areas[3].tribes = 1
            deck.push({ circle: 5 }, { square: 11 });
            reduce.push([ 4, 3, 2 ]);
            done(function() {
                this.changes.should.deep.equal({
                    5: {'tribes': -2 },
                    4: {'tribes': -3 },
                    3: {'tribes': -1 },
                    2: {'tribes': -3 },
                })
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
    });
    describe("in harder case", function() {
        beforeEach(function() {
            event = require('../../src/events/epidemic')
            // 4 - 3 - 2
            //  \ /
            //   5
            state.map.areas = {
                5: { id: 5, tribes: 3, neighbours: [ 3,4 ]},
                4: { id: 4, tribes: 3, neighbours: [ 3, 5 ]},
                3: { id: 3, tribes: 3, neighbours: [ 2, 3, 4 ] },
                2: { id: 2, tribes: 3, neighbours: [ 3 ] },
            }
            // tribe count: 12
        });
        it("should give the option to choose", function(d) {
            deck.push({ circle: 5 }, { square: 11 });
            reduce.push([3, 4]);
            done(function() {
                this.changes.should.deep.equal({
                    5: {'tribes': -3 },
                    3: {'tribes': -3 },
                    4: {'tribes': -3 },
                });
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
        it("should have correct amount and current", function(d) {
            deck.push({ circle: 5 }, { square: 9 });
            reduce.push([3]);
            notok(function(ok) {
                ok.ok.should.be.false;
                ok.amount.should.equal(3);
                ok.current.should.deep.equal({
                    2: { tribes: 3 },
                    4: { tribes: 3 },
                });
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
        it("should stop", function(d) {
            deck.push({ circle: 5 }, { square: 4 });
            reduce.push([3]);
            done(function(ok) {
                ok.ok.should.be.true;
                ok.amount.should.equal(0);
                this.changes.should.deep.equal({
                    5: {'tribes': -3 },
                    3: {'tribes': -1 },
                });
                ok.current.should.deep.equal({ });
                d();
            });
            runEvent(event, { expr: 's' }, state);
        });
    });
})