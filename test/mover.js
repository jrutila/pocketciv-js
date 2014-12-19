var should = require('chai').should()
var pocketciv = require('../core/pocketciv')
var event = require('../core/event')

describe('TribeMover', function() {
    describe('simple', function() {
        beforeEach(function() {
            map = {
                1: { 'neighbours': [2] },
                2: { 'neighbours': [1,3] },
                3: { 'neighbours': [2] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 1, 2: 1, 3: 1 });
            mover.ok({ 1: 1, 2: 1, 3: 1 }).should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 1, 2: 1, 3: 0 });
            mover.ok({ 1: 0, 2: 1, 3: 1 }).should.be.true;
        });
        it('case 3', function() {
            mover.init({ 1: 2, 2: 0, 3: 0 });
            mover.ok({ 1: 0, 2: 2, 3: 0 }).should.be.true;
            mover.ok({ 1: 1, 2: 1, 3: 0 }).should.be.true;
            mover.ok({ 1: 1, 2: 0, 3: 1 }).should.be.false;
        });
        it('case 4 - neighbour limit', function() {
            mover.init({ 1: 2, 2: 0, 3: 0 });
            mover.ok({ 1: 2, 2: 2, 3: 0 }).should.be.false;
            mover.ok({ 1: 0, 2: 0, 3: 0 }).should.be.false;
        });
    });
    describe('complex', function() {
        beforeEach(function() {
            //   1 - 2
            //        \
            //         3
            //        / \
            //       4 - 5
            map = {
                1: { 'neighbours': [2] },
                2: { 'neighbours': [1,3] },
                3: { 'neighbours': [2,4,5] },
                4: { 'neighbours': [3,5] },
                5: { 'neighbours': [3,4] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 });
            mover.ok({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 2, 3: 1, 4: 0, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 3, 3: 0, 4: 0, 5: 0 }).should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 });
            mover.ok({ 1: 0, 2: 0, 3: 2, 4: 0, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 }).should.be.true;
        });
        it('case 3', function() {
            mover.init({ 1: 6, 2: 6, 3: 6, 4: 0, 5: 0 });
            mover.ok({ 1: 6, 2: 6, 3: 6, 4: 3, 5: 3 }).should.be.false;
        });
    });
    describe('big one', function() {
        beforeEach(function() {
            //       2 - 7
            //      / \ / \
            //     1 - 3 - 6
            //      \ / \ /
            //       4 - 5
            map = {
                1: { 'neighbours': [2, 3, 4] },
                2: { 'neighbours': [1, 3, 7] },
                3: { 'neighbours': [1, 2, 7, 6, 5, 4] },
                4: { 'neighbours': [1, 3, 5] },
                5: { 'neighbours': [3, 4, 6] },
                6: { 'neighbours': [3, 5, 7] },
                7: { 'neighbours': [2, 3, 6] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 0, 2: 0, 3: 6, 4: 0, 5: 0, 6: 0, 7: 0 });
            mover.ok({ 1: 1, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1 }).should.be.true;
        });
    });
    describe('with sea and frontier', function() {
        beforeEach(function() {
            //       1 - 2---------
            //      SEA / \
            //         /   3
            //        /   / \ FRONTIER
            //           4 - 5
            map = {
                1: { 'neighbours': [2, 'sea'] },
                2: { 'neighbours': [1, 3, 'sea', 'frontier'] },
                3: { 'neighbours': [2, 5, 4, 'frontier'] },
                4: { 'neighbours': [3, 5, 'frontier'] },
                5: { 'neighbours': [3, 4, 'frontier'] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 0, 2: 0, 3: 6, 4: 0, 5: 0 });
            mover.ok({ 1: 0, 2: 3, 3: 0, 4: 2, 5: 1 }).should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 6, 2: 6, 3: 6, 4: 0, 5: 0 });
            mover.ok({ 1: 6, 2: 6, 3: 6, 4: 3, 5: 3 }).should.be.false;
        });
    });
    describe('with undefined', function() {
        it('should work as they were 0', function() {
            map = { 1: { "id": 1, "neighbours": [ 2 ] },
                    2: { "id": 2, "neighbours": [ 1 ] }};
            mover = new pocketciv.TribeMover(map, 1)
            mover.init({ 1: undefined, 2: 1 })
            mover.ok({ 1: 1, 2: undefined }).should.be.true;
        })
    });
    describe('scenario 1', function() {
        beforeEach(function() {
            map = {
    "1": { "id": 1, "neighbours": [ 3, 4, 8, 'frontier' ], "forest": true },
    "2": { "id": 2, "desert": true, "neighbours": [ 3, 5, 8, 'sea', 'frontier' ]  },
    "3": { "id": 3, "desert": true, "neighbours": [ 1, 2, 4, 8, 'frontier' ], },
    "4": { "id": 4, "desert": true, "neighbours": [ 1, 3, 'frontier' ]  },
    "5": { "id": 5, "tribes": 1, "neighbours": [ 2, 7, 'sea' ], "mountain": true },
    "7": { "id": 7, "neighbours": [ 5, 8, 'sea' ], "forest": true },
    "8": { "id": 8, "neighbours": [ 1, 2, 3, 7, 'sea', 'frontier' ], "forest": true, "mountain": true }
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('first round', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 0, 8: 0 });
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 0, 8: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 7: 1, 8: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 7: 0, 8: 0 }).should.be.false;
        });
        it('second round', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 2, 8: 0 });
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 2, 8: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 1, 3: 0, 4: 0, 5: 1, 7: 1, 8: 1 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 7: 1, 8: 1 }).should.be.false;
        })
        
    });
    describe('simple with two steps', function() {
        beforeEach(function() {
            // 1 - 2 - 3 - 4
            map = {
                1: { 'neighbours': [2] },
                2: { 'neighbours': [1,3] },
                3: { 'neighbours': [2,4] },
                4: { 'neighbours': [3] },
            }
            mover = new pocketciv.TribeMover(map, 2);
        });
        it('case 1', function() {
            mover.init({ 1: 1, 2: 1, 3: 1, 4: 1 });
            mover.ok({ 1: 1, 2: 1, 3: 1, 4: 1 }).should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 1, 2: 1, 3: 0, 4: 0 });
            mover.ok({ 1: 0, 2: 1, 3: 1, 4: 0 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 1 }).should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 2, 4: 0 }).should.be.true;
        });
        it('case 3', function() {
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 0 });
            mover.ok({ 1: 0, 2: 2, 3: 0, 4: 0 }).should.be.true;
            mover.ok({ 1: 1, 2: 1, 3: 0, 4: 0 }).should.be.true;
            mover.ok({ 1: 1, 2: 0, 3: 0, 4: 1 }).should.be.false;
        });
        it('case 4 - neighbour limit', function() {
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 0 });
            mover.ok({ 1: 2, 2: 2, 3: 0, 4: 0 }).should.be.false;
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0 }).should.be.false;
        });
    });
});