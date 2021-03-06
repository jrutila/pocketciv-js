var should = require('chai').should();
var expect = require('chai').expect;
var pocketciv = require('../../src/core/pocketciv');
var event = require('../../src/core/event');

describe.only('TribeMover', function() {
    describe('inner methods', function() {
        it('_burns', function() {
            var tm = new pocketciv.TribeMover({});
            var b = tm._burns([
                { max: 2, burn: [2], sea: [] },
                { max: 1, burn: [3], sea: [] },
                ], 2);
            var result = b.next();
            result.value.should.deep.equal({ burn: { 2: 2 }, cost: [] });
            result = b.next();
            result.value.should.deep.equal({ burn: { 2: 1, 3: 1 }, cost: []});
            result = b.next();
            result.done.should.be.true;
        });
        it('burns doubles', function() {
            var tm = new pocketciv.TribeMover({});
            var b = tm._burns([
                { max: 2, burn: [2,4], sea: [] },
                { max: 1, burn: [3], sea: [] },
                ], 2);
            var result = b.next();
            result.value.should.deep.equal({ burn: { 2: 2, 4: 2 }, cost: [] });
            result = b.next();
            result.value.should.deep.equal({ burn: { 2: 1, 4: 1, 3: 1 }, cost: []});
            result = b.next();
            result.done.should.be.true;
        });
        it('burns and costs', function() {
            var tm = new pocketciv.TribeMover({});
            var b = tm._burns([
                { max: 2, burn: [2], sea: [[1,2]] },
                { max: 2, burn: [3], sea: [[3,4]] },
                ], 2);
            var result = b.next();
            result.value.should.deep.equal({ burn: { 2: 2 }, cost: [[1,2]]});
            result = b.next();
            result.value.should.deep.equal({ burn: { 2: 1, 3: 1 }, cost: [[1,2],[3,4]]});
            result = b.next();
            result.value.should.deep.equal({ burn: { 3: 2 }, cost: [[3,4]]});
            result = b.next();
            result.done.should.be.true;
        });
    });
    describe('simple', function() {
        beforeEach(function() {
            // 1 - 2 - 3
            map = {
                1: { 'neighbours': [2] },
                2: { 'neighbours': [1,3] },
                3: { 'neighbours': [2] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 1, 2: 1, 3: 1 });
            mover.ok(  { 1: 1, 2: 1, 3: 1 }).ok.should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 1, 2: 1, 3: 0 });
            mover.ok(  { 1: 0, 2: 1, 3: 1 }).ok.should.be.true;
        });
        describe('case 3', function() {
            beforeEach(function() {
                mover.init({ 1: 2, 2: 0, 3: 0 });
            });
            it('should work', function() {
                mover.ok({ 1: 0, 2: 2, 3: 0 }).ok.should.be.true;
                mover.ok({ 1: 1, 2: 1, 3: 0 }).ok.should.be.true;
            });
            it('should fail', function() {
                mover.ok({ 1: 1, 2: 0, 3: 1 }).ok.should.be.false;
            });
        });
        it('case 4 - neighbour limit', function() {
            mover.init({ 1: 2, 2: 0, 3: 0 });
            mover.ok({ 1: 2, 2: 2, 3: 0 }).ok.should.be.false;
            mover.ok({ 1: 0, 2: 0, 3: 0 }).ok.should.be.false;
        });
        it('large amounts', function() {
            mover.init({ 1: 18, 2: 19, 3: 0 });
            mover.ok(  { 1: 10, 2: 25, 3: 2 }).ok.should.be.true;
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
            mover.ok({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 2, 3: 1, 4: 0, 5: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 3, 3: 0, 4: 0, 5: 0 }).ok.should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 });
            mover.ok({ 1: 0, 2: 0, 3: 2, 4: 0, 5: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 }).ok.should.be.true;
        });
        it('case 3', function() {
            mover.init({ 1: 6, 2: 6, 3: 6, 4: 0, 5: 0 });
            mover.ok({ 1: 6, 2: 6, 3: 6, 4: 3, 5: 3 }).ok.should.be.false;
        });
    });
    describe('diamond', function() {
        beforeEach(function() {
            //   1 - 2
            //   |   | 
            //   3 - 4
            map = {
                1: { 'neighbours': [2,3] },
                2: { 'neighbours': [1,4] },
                3: { 'neighbours': [1,4] },
                4: { 'neighbours': [2,3] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 2, 2: 2, 3: 2, 4: 0 });
            mover.ok(  { 1: 0, 2: 1, 3: 1, 4: 4 }).ok.should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 2, 2: 2, 3: 2, 4: 0 });
            mover.ok(  { 1: 1, 2: 1, 3: 1, 4: 3 }).ok.should.be.true;
        });
    });
    describe('diamond with twist', function() {
        beforeEach(function() {
            //   1 - 3
            //   | / | 
            //   3 - 2
            map = {
                1: { 'neighbours': [3,4,'sea'] },
                2: { 'neighbours': [3,4, 'sea'] },
                3: { 'neighbours': [1,2,4] },
                4: { 'neighbours': [1,2,3,'sea'] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 2', function() {
            mover.init({ 1: 0, 2: 2, 3: 2, 4: 2 });
            mover.ok(  { 1: 3, 2: 1, 3: 1, 4: 1 }).ok.should.be.true;
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
            mover.ok(  { 1: 1, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1 }).ok.should.be.true;
        });
    });
    describe('with sea and frontier', function() {
        beforeEach(function() {
            //       1 - 2---------
            //          / \
            //    SEA   |  3
            //          \ / \ FRONTIER
            //           4 - 5
            //           |
            map = {
                1: { 'neighbours': [2, 'sea'] },
                2: { 'neighbours': [1, 3, 'sea', 'frontier'] },
                3: { 'neighbours': [2, 5, 4, 'frontier'] },
                4: { 'neighbours': [3, 5, 'sea', 'frontier'] },
                5: { 'neighbours': [3, 4, 'frontier'] },
            }
            mover = new pocketciv.TribeMover(map, 1);
        });
        it('case 1', function() {
            mover.init({ 1: 0, 2: 0, 3: 6, 4: 0, 5: 0 });
            mover.ok(  { 1: 0, 2: 3, 3: 0, 4: 2, 5: 1 }).ok.should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 6, 2: 6, 3: 6, 4: 0, 5: 0 });
            mover.ok(  { 1: 6, 2: 6, 3: 6, 4: 3, 5: 3 }).ok.should.be.false;
        });
        it('cannot move across the sea', function() {
            mover.init({ 1: 6, 2: 6, 3: 0, 4: 0, 5: 0 });
            mover.ok({ 1: 3, 2: 6, 3: 0, 4: 3, 5: 0 }).ok.should.be.false;
        });
    });
    describe('sea cost', function() {
        describe('basic1: over one sea', function() {
            beforeEach(function() {
                //       1 - 2
                //
                //        sea 
                //
                // ----- 3 - 4 ---------
                map = {
                    1: { 'neighbours': [ 2, 'sea' ] },
                    2: { 'neighbours': [ 1, 'sea' ] },
                    3: { 'neighbours': [ 4, 'sea', 'frontier'] },
                    4: { 'neighbours': [ 3, 'sea', 'frontier'] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 0, 2: 0, 3: 3, 4: 0 });
                var ok =
                mover.ok(  { 1: 3, 2: 0, 3: 0, 4: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 1: 1 } ]);
            });
            it('case 2: inner move', function() {
                mover.init({ 1: 1, 2: 0, 3: 3, 4: 0 });
                var ok =
                mover.ok(  { 1: 3, 2: 1, 3: 0, 4: 0 });
                ok.ok.should.be.true;
                // Remove either from 1 or 2
                ok.cost.should.deep.equal([ { 1: 1 } ]);
            });
            it('case 3: both moves', function() {
                mover.init({ 1: 0, 2: 0, 3: 2, 4: 2 });
                var ok =
                mover.ok(  { 1: 2, 2: 2, 3: 0, 4: 0 });
                ok.ok.should.be.true;
                // Remove from both 1 and 2
                ok.cost.should.deep.equal([ { 1: 1, 2: 1 } ]);
            });
            it('case 4: two-step move', function() {
                mover.init({ 1: 0, 2: 0, 3: 0, 4: 4 });
                var ok =
                mover.ok(  { 1: 2, 2: 2, 3: 0, 4: 0 });
                ok.ok.should.be.true;
                // There needs to be two trips over the sea
                ok.cost.should.deep.equal([ { 1: 1,  2: 1 } ]);
            });
            it('case 5: two-step move wont help', function() {
                mover.init({ 1: 0, 2: 0, 3: 2, 4: 2 });
                var ok =
                mover.ok(  { 1: 2, 2: 2, 3: 0, 4: 0 });
                ok.ok.should.be.true;
                // There needs to be two trips over the sea
                ok.cost.should.deep.equal([ { 1: 1, 2: 1 } ]);
            });
        });
        describe('basic2: chained', function() {
            beforeEach(function() {
                //  1       3       5
                //  | first | secon |
                //  2       4       6
                map = {
                    1: { 'neighbours': [ 2, 'first' ] },
                    2: { 'neighbours': [ 1, 'first' ] },
                    3: { 'neighbours': [ 4, 'second', 'first'] },
                    4: { 'neighbours': [ 3, 'second', 'first'] },
                    5: { 'neighbours': [ 6, 'second' ] },
                    6: { 'neighbours': [ 5, 'second' ] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 0, 3: 2, 4: 0, 5: 0, 6: 0 });
                ok.ok.should.be.true;
            });
            it('case 2', function() {
                mover.init({ 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 0 });
                ok.ok.should.be.false;
            });
            it('case 3: over two seas!', function() {
                mover = new pocketciv.TribeMover(map, 2, 1);
                mover.init({ 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3, 6: 0 });
                ok.ok.should.be.false;
            });
            it('case 3: over two seas should leave to 3 one', function() {
                mover = new pocketciv.TribeMover(map, 2, 1);
                mover.init({ 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2, 6: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 5: 1, 3: 1 } ]);
            });
        });
        describe('basic4: central point', function() {
            beforeEach(function() {
                //      4    
                //      |       
                // 1 -  2  - 3 - 5 
                map = {
                    1: { 'neighbours': [ 2 ] },
                    2: { 'neighbours': [ 1, 3, 4 ] },
                    3: { 'neighbours': [ 2, 5 ] },
                    4: { 'neighbours': [ 2 ] },
                    5: { 'neighbours': [ 3 ] },
                }
                mover = new pocketciv.TribeMover(map, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 2, 2: 2, 3: 0, 4: 0, 5: 0 });
                var ok =
                mover.ok(  { 1: 1, 2: 1, 3: 1, 4: 1, 5: 0 });
                ok.ok.should.be.true;
            });
        });
        describe('basic3: no islands', function() {
            beforeEach(function() {
                // 1  sea    
                //  \       
                //   2  - 3
                map = {
                    1: { 'neighbours': [ 2, 'sea' ] },
                    2: { 'neighbours': [ 1, 3, 'sea' ] },
                    3: { 'neighbours': [ 2, 'sea' ] },
                    //4: { 'neighbours': [ 3, 'sea' ] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 2, 2: 0, 3: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 2, 3: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ ]);
            });
            it('case 2', function() {
                mover.init({ 1: 2, 2: 0, 3: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 0, 3: 2 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 3: 1 } ]);
            });
            it('case 3: one in the middle forcing sea', function() {
                mover.init({ 1: 2, 2: 1, 3: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 1, 3: 2 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 3: 1 } ]);
            });
            it('case 4: one in the middle not forcing sea', function() {
                mover.init({ 1: 2, 2: 2, 3: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 2, 3: 2 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([]);
            });
        });
        describe('basic3.1: no islands', function() {
            beforeEach(function() {
                // 1  sea    4
                //  \       / 
                //   2  - 3
                map = {
                    1: { 'neighbours': [ 2, 'sea' ] },
                    2: { 'neighbours': [ 1, 3, 'sea' ] },
                    3: { 'neighbours': [ 2, 4, 'sea' ] },
                    4: { 'neighbours': [ 3, 'sea' ] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 2', function() {
                mover.init({ 1: 2, 2: 0, 3: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 0, 3: 2 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 3: 1 } ]);
            });
            it('case 3', function() {
                mover.init({ 1: 2, 4: 0 });
                var ok =
                mover.ok(  { 1: 0, 4: 2 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 4: 1 } ]);
            });
        });
        describe('basic3.2: no islands and frontier', function() {
            beforeEach(function() {
                // 1  sea    4
                //  \-------/ 
                //   2  - 3
                map = {
                    1: { 'neighbours': [ 2, 'sea' ] },
                    2: { 'neighbours': [ 1, 3 ] },
                    3: { 'neighbours': [ 2, 4 ] },
                    4: { 'neighbours': [ 3, 'sea' ] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 2, 2: 2, 3: 2, 4: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 2, 3: 1, 4: 3 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 4: 1 } ]);
            });
            it('case 2', function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 1: 2, 2: 2, 3: 2, 4: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 2, 3: 1, 4: 3 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 4: 1 } ]);
            });
            it('case 3', function() {
                mover = new pocketciv.TribeMover(map, 2, 1);
                mover.init({ 1: 2, 2: 2, 3: 2, 4: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 2, 3: 1, 4: 3 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([]);
            });
        });
        describe('straightaway', function() {
            beforeEach(function() {
                // 1
                // |  first    3  - 4   scnd    5 - 6 - 7
                // 2
                map = {
                    1: { 'neighbours': [ 2, 'first' ] },
                    2: { 'neighbours': [ 1, 'first' ] },
                    3: { 'neighbours': [ 4, 'first' ] },
                    4: { 'neighbours': [ 3 ] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 2, 2: 2, 3: 2, 4: 0 });
                var ok =
                mover.ok(  { 1: 1, 2: 1, 3: 2, 4: 2 });
                ok.ok.should.be.true;
            });
            it('case 2', function() {
                mover.init({ 1: 0, 2: 0, 3: 2, 4: 2 });
                var ok =
                mover.ok(  { 1: 1, 2: 1, 3: 2, 4: 0 });
                ok.ok.should.be.true;
            });
            it('case 3', function() {
                mover.init({ 1: 2, 2: 2, 3: 0, 4: 0 });
                var ok =
                mover.ok(  { 1: 1, 2: 1, 3: 2, 4: 0 });
                ok.ok.should.be.true;
                // 2 -> 3 and 1 -> 2
                ok.cost.should.deep.equal([ { 3: 1 }]);
            });
        });
        describe('complex1', function() {
            beforeEach(function() {
                //       1 - 2
                //         |     west
                //  east   |
                //         \---3----------
                //          \-/ \ FRONTIER
                //       6 - 4 - 5 - 7
                map = {
                    1: { 'neighbours': [2, 'east' ] },
                    2: { 'neighbours': [1, 'west' ] },
                    3: { 'neighbours': [5, 4, 'west', 'frontier'] },
                    4: { 'neighbours': [3, 5, 6, 'east', 'frontier'] },
                    5: { 'neighbours': [3, 4, 7, 'frontier'] },
                    6: { 'neighbours': [4, 'east'] },
                    7: { 'neighbours': [5, 'frontier'] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 1 and double test', function() {
                mover.init({ 1: 0, 2: 0, 3: 3, 4: 0, 5: 0, 6: 0, 7: 0 });
                mover.ok(  { 1: 0, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }).ok.should.be.true;
                mover.ok(  { 1: 0, 2: 2, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0 }).ok.should.be.true;
            });
            it('case 2', function() {
                mover.init({ 1: 0, 2: 0, 3: 0, 4: 3, 5: 0, 6: 0, 7: 0 });
                mover.ok(  { 1: 0, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }).ok.should.be.false;
                mover.ok(  { 1: 0, 2: 0, 3: 2, 4: 0, 5: 0, 6: 1, 7: 0 }).ok.should.be.true;
            });
            it('case 3', function() {
                mover.init({ 1: 3, 2: 3, 3: 0, 4: 3, 5: 0, 6: 0, 7: 0 });
                mover.ok(  { 1: 1, 2: 1, 3: 3, 4: 1, 5: 0, 6: 3, 7: 0 }).ok.should.be.true;
            });
            it('case 4', function() {
                mover.init({ 1: 0, 2: 3, 3: 0, 4: 3, 5: 0, 6: 0, 7: 0 });
                mover.ok(  { 1: 0, 2: 5, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0 }).ok.should.be.false;
            });
            it('changes by max', function() {
                mover.init({ 1: 0, 2: 3, 3: 0, 4: 3, 5: 0, 6: 0, 7: 0 });
                var ok =
                mover.ok(  { 1: 6, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([
                        { 1: 1 }
                        ]);
            });
            it('changes by rel 0', function() {
                mover.init({ 1: 3, 2: 3, 3: 0, 4: 3, 5: 0, 6: 0, 7: 0 });
                var ok =
                mover.ok(  { 1: 2, 2: 3, 3: 2, 4: 2, 5: 0, 6: 0, 7: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([
                    { 3: 1 }
                ])
            });
        });
        describe('complex2', function() {
            beforeEach(function() {
                //       1 - 2
                //              
                //        sea 
                //
                //    3 - 4 - 5 - FRONTIER - 6
                map = {
                    1: { 'neighbours': [2, 'sea' ] },
                    2: { 'neighbours': [1, 'sea' ] },
                    3: { 'neighbours': [4, 'sea', 'frontier'] },
                    4: { 'neighbours': [3, 5, 'sea', 'frontier'] },
                    5: { 'neighbours': [4, 'sea', 'frontier'] },
                    6: { 'neighbours': ['sea', 'frontier'] },
                }
                mover = new pocketciv.TribeMover(map, 1, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 2, 2: 5, 3: 0, 4: 0, 5: 0, 6: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 3, 3: 2, 4: 0, 5: 0, 6: 2 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([ { 3: 1, 6: 1 }]);
                mover.ok(  { 1: 0, 2: 3, 3: 2, 4: 0, 5: 2, 6: 0 })
                 .cost.should.deep.equal([ { 5: 1, 3: 1 }]);
            });
            it('case neighbours because of move limit 1', function() {
                mover.init({ 1: 2, 2: 5, 3: 0, 4: 0, 5: 0, 6: 0 });
                var ok =
                mover.ok(  { 1: 0, 2: 3, 3: 2, 4: 2, 5: 0, 6: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([
                    { 4: 1, 3: 1 }
                    ]);
            });
        });
        describe('scenario 2', function() {
            beforeEach(function() {
                /*     8 --- 4 -----
                  f  / |     |
                    /  6     |
                    | /  \  /
                    5 --- 3
                   /             sea
                **/
                map = {
                "3": { "id": 3, "tribes": 1, "farm": true, "neighbours": [ 4, 5, 6, 'sea'], },
                "4": { "id": 4, "tribes": 1, "mountain": true, "forest": true, "farm": true, "neighbours": [ 3, 8, 'sea', 'frontier'] },
                "5": { "id": 5, "tribes": 1, "mountain": true, "forest": true, "neighbours": [ 3, 6, 8, 'sea', 'frontier'], "mountain": true },
                "6": { "id": 6, "tribes": 1, "neighbours": [ 3, 5, 8 ], "forest": true },
                "8": { "id": 8, "neighbours": [  4, 5, 6, 'frontier'], "desert": true }
                }
            });
            it('over the sea?', function() {
                mover = new pocketciv.TribeMover(map, 1);
                mover.init({ 3: 0, 4: 0, 5: 2, 8: 0 });
                mover.ok(  { 3: 0, 4: 2, 5: 0, 8: 0 }).ok.should.be.false;
            });
            it('over the sea!', function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 3: 0, 4: 0, 5: 2, 8: 0 });
                var ok =
                mover.ok(  { 3: 0, 4: 2, 5: 0, 8: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([{4:1}])
            });
            it('free sailing', function() {
                mover = new pocketciv.TribeMover(map, 1, 0);
                mover.init({ 3: 0, 4: 0, 5: 2, 8: 0 });
                mover.ok({ 3: 0, 4: 2, 5: 0, 8: 0 }).ok.should.be.true;
                mover.ok({ 3: 0, 4: 2, 5: 0, 8: 0 }).cost.should.deep.equal([]);
            });
            it('bypassing', function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init(       { 3: 0, 4: 4, 5: 3, 6: 0, 8: 0 });
                var ok = mover.ok({ 3: 0, 4: 1, 5: 3, 6: 3, 8: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([{5:1}]);
            });
            it('simple case', function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 3: 0, 4: 2, 5: 2, 8: 0 });
                var ok =
                mover.ok(  { 3: 1, 4: 1, 5: 2, 8: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([])
                
            });
        });
        describe('scenario 7', function() {
            beforeEach(function() {
                /*    1 f 2
                
                       sea
                
                 7 - 5 - 6 - 3 - 4 
                          \ /
                           8
                */
                map = {
                "1": { "id": 1, "forest": true, "volcano": true, "neighbours": [ 'sea', 'frontier' ], },
                "2": { "id": 2, "forest": true, "mountain": true, "neighbours": [ 'sea', 'frontier' ], },
                "3": { "id": 3, "mountain": true, "neighbours": [ 4, 6, 8, 'sea', 'frontier'], },
                "4": { "id": 4, "forest": true, "neighbours": [ 3, 'sea', 'frontier'] },
                "5": { "id": 5, "desert": true, "neighbours": [ 6, 7, 'sea', 'frontier'] },
                "6": { "id": 6, "forest": true, "neighbours": [ 3, 5, 8, 'sea', 'frontier'], },
                "7": { "id": 7, "forest": true, "neighbours": [ 5, 'sea', 'frontier' ] },
                "8": { "id": 8, "desert": true, "mountain": true, "tribes": 3, "neighbours": [ 3, 6, 'frontier' ] },
                }
            });
            it('case 1', function() {
                mover = new pocketciv.TribeMover(map, 1);
                mover.init({ 8: 4 });
                mover.ok(  { 8: 3, 3: 1 }).ok.should.be.true;
            });
            it('case 2', function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 1: 2 });
                var ok =
                mover.ok(  { 2: 2 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([{2:1}]);
            });
            it('case 3', function() {
                mover = new pocketciv.TribeMover(map, 1, 2);
                mover.init({ 6: 2, 8: 2 });
                var ok =
                mover.ok(  { 1: 1, 2: 1, 6: 1, 8: 1 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([{1:2,2:2}]);
            });
            it('slow case', function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 1: 2, 2: 3, 5: 2, 6: 2, 3: 2, 4: 3 });
                mover.ok(  { 1: 3, 2: 3, 5: 2, 6: 1, 3: 2, 4: 3 }).ok.should.be.true;
                
            });
        });
    });
    describe('with undefined', function() {
        it('should work as they were 0', function() {
            map = { 1: { "id": 1, "neighbours": [ 2 ] },
                    2: { "id": 2, "neighbours": [ 1 ] }};
            mover = new pocketciv.TribeMover(map, 1)
            mover.init({ 1: undefined, 2: 1 })
            mover.ok({ 1: 1, 2: undefined }).ok.should.be.true;
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
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 0, 8: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 7: 1, 8: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 7: 0, 8: 0 }).ok.should.be.false;
        });
        it('second round', function() {
            mover.init({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 2, 8: 0 });
            mover.ok({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 7: 2, 8: 0 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 1, 3: 0, 4: 0, 5: 1, 7: 1, 8: 1 }).ok.should.be.true;
            mover.ok({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 7: 1, 8: 1 }).ok.should.be.false;
        });
    });
    describe('central point', function() {
        beforeEach(function() {
            /*
             2       5
             | \   / |
             3 - 4 - 1
            */
            map = {
             "1": { "id":  1, "neighbours": [  4, 5 ] },
             "2": { "id":  2, "neighbours": [  3, 4 ] },
             "3": { "id":  3, "neighbours": [  2, 4 ] },
             "4": { "id":  4, "neighbours": [  1, 2, 3, 5 ] },
             "5": { "id":  5, "neighbours": [  1, 4 ] },
            }
        });
        it('is fine', function() {
            mover = new pocketciv.TribeMover(map, 1);
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2 });
            mover.ok(  { 1: 1, 2: 2, 3: 0, 4: 1, 5: 2 }).ok.should.be.true;
        });
        it('is failing', function() {
            mover = new pocketciv.TribeMover(map, 1);
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2 });
            mover.ok(  { 1: 1, 2: 2, 3: 1, 4: 0, 5: 2 }).ok.should.be.false;
        });
        describe('with island', function() {
            beforeEach(function() {
                map[8] = { id: 8, neighbours: [ 7, 'sea' ] };
                map[7] = { id: 7, neighbours: [ 8, 'sea' ] };
                map[5].neighbours.push('sea');
                mover = new pocketciv.TribeMover(map, 1);
            });
            it('move in the mainland works', function() {
                mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2, 7: 0, 8: 0 });
                mover.ok(  { 1: 1, 2: 2, 3: 0, 4: 1, 5: 2, 7: 0, 8: 0 }).ok.should.be.true;
            });
            it('move in the mainland fails', function() {
                mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2, 7: 0, 8: 0 });
                mover.ok(  { 1: 1, 2: 2, 3: 1, 4: 0, 5: 2, 7: 0, 8: 0 }).ok.should.be.false;
            });
            it('move in island works', function() {
                mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2, 7: 1, 8: 0 });
                mover.ok(  { 1: 1, 2: 2, 3: 0, 4: 1, 5: 2, 7: 0, 8: 1 }).ok.should.be.true;
            });
            it('move in island works', function() {
                mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2, 7: 1, 8: 0 });
                mover.ok(  { 1: 1, 2: 2, 3: 0, 4: 2, 5: 2, 7: 0, 8: 0 }).ok.should.be.false;
            });
        });
    });
    describe('neighborhood', function() {
        beforeEach(function() {
            /*
         6 - 2       5 - 7
             | \   / | /
             3 - 4 - 1
            */
            map = {
             "1": { "id":  1, "neighbours": [ 4, 5, 7 ] },
             "2": { "id":  2, "neighbours": [ 3, 4, 6 ] },
             "3": { "id":  3, "neighbours": [ 2, 4 ] },
             "4": { "id":  4, "neighbours": [ 1, 2, 3, 5 ] },
             "5": { "id":  5, "neighbours": [ 1, 4, 7 ] },
             "6": { "id":  6, "neighbours": [ 2 ] },
             "7": { "id":  7, "neighbours": [ 1, 5 ] },
            }
        });
        it('is fail', function() {
            mover = new pocketciv.TribeMover(map, 1);
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2 });
            mover.ok(  { 1: 1, 2: 2, 3: 0, 4: 1, 5: 2 }).ok.should.be.true;
            //mover.ok(  { 1: 1, 2: 2, 3: 1, 4: 0, 5: 2 }).ok.should.be.false;
        });
    });
    describe('neighborhood2', function() {
        beforeEach(function() {
            /*
                7
                |
                2       5
              /   \   /
            1   |   4   |
              \   /   \
                3       6
            */
            map = {
             "1": { "id":  1, "neighbours": [ 2, 3 ] },
             "2": { "id":  2, "neighbours": [ 1, 3, 4, 7 ] },
             "3": { "id":  3, "neighbours": [ 1, 2, 4 ] },
             "4": { "id":  4, "neighbours": [ 2, 3, 5, 6 ] },
             "5": { "id":  5, "neighbours": [ 4, 6 ] },
             "6": { "id":  6, "neighbours": [ 4, 5 ] },
             "7": { "id":  7, "neighbours": [ 2 ] },
            }
        });
        it('is fail', function() {
            mover = new pocketciv.TribeMover(map, 1);
            mover.init({ 1: 2, 5: 2, 7: 2 });
            mover.ok(  { 1: 2, 4: 2, 7: 2 }).ok.should.be.true;
        });
    });
    describe('scenario 12', function() {
        beforeEach(function() {
            /*
             2       5
             | \   / |
             3 - 4 - 1
                   \ |
                     8   sea  7
            */
            map = {
             "1": { "id":  1, "forest": true, "neighbours": [  4,  5,  8, 'eastern' ], },
             "2": { "id":  2, "forest": true, "mountain": true, "neighbours": [  3,  4, 'western', 'frontier' ], },
             "3": { "id":  3, "forest": true, "neighbours": [  2,  4, 'western', 'frontier' ] , },
             "4": { "id":  4, "desert": true, "neighbours": [  1,  2,  3,  5,  8, 'frontier' ] },
             "5": { "id":  5, "forest": true, "mountain": true, "neighbours": [  1,  4, 'eastern', 'frontier' ], },
             "7": { "id":  7, "forest": true, "neighbours": [ 'eastern', 'frontier' ], },
             "8": { "id":  8, "forest": true, "volcano": true, "neighbours": [  1,  4, 'eastern', 'frontier' ], },
            }
        });
        it('interesting thing', function() {
            mover = new pocketciv.TribeMover(map, 1);
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 2, 5: 2, 8: 2 });
            mover.ok(  { 1: 2, 2: 2, 3: 1, 4: 0, 5: 1, 8: 2 }).ok.should.be.false;
        });
        it('lots of tribes', function() {
            mover = new pocketciv.TribeMover(map, 1);
            mover.init({ 1: 8, 2: 0, 3: 0, 4: 2, 5: 14, 8: 16 });
            mover.ok(  { 1: 6, 2: 2, 3: 0, 4: 2, 5: 14, 8: 16 }).ok.should.be.true;
        });
        it('moving from area 7 to 2 through 8', function() {
            // Roadbuilding acquired
            map[7].neighbours.push(8);
            map[8].neighbours.push(7);
            mover = new pocketciv.TribeMover(map, 2);
            mover.init({ 1: 0, 2: 3, 3: 0, 4: 0, 5: 2, 7: 2, 8: 2 });
            mover.ok(  { 1: 0, 2: 4, 3: 0, 4: 0, 5: 2, 7: 1, 8: 2 }).ok.should.be.true;
            
        });
        it('moving from area 7 to 2 through 4', function() {
            // Roadbuilding acquired
            map[7].neighbours.push(8);
            map[8].neighbours.push(7);
            mover = new pocketciv.TribeMover(map, 2);
            mover.init({ 1: 0, 2: 3, 3: 0, 4: 2, 5: 2, 7: 2, 8: 2 });
            mover.ok(  { 1: 0, 2: 4, 3: 0, 4: 2, 5: 4, 7: 1, 8: 0 }).ok.should.be.true;
            
        });
    });
    describe('scenario 6', function() {
        beforeEach(function() {
            /*   1 - 7
               / | / |
              2--3 - 4
              | / \ /
               5 - 8 - 6
            */
            map = {
             "1": { "id":  1, "neighbours": [2,3,7], },
             "2": { "id":  2, "neighbours": [1,3,5,'sea'], },
             "3": { "id":  3, "neighbours": [1,2,4,5,7,8,'sea'] , },
             "4": { "id":  4, "neighbours": [3,7,8] },
             "5": { "id":  5, "neighbours": [2,3,8,'sea'], },
             "6": { "id":  6, "neighbours": [8,'sea'], },
             "7": { "id":  7, "neighbours": [1,3,4], },
             "8": { "id":  8, "neighbours": [3,4,5,6,'sea'], },
            }
        });
        it('works', function() {
            mover = new pocketciv.TribeMover(map);
            mover.init({ 1: 3, 2: 2, 3: 2, 4: 2, 5: 2, 6: 0, 7: 2, 8: 0 });
            var ok =
            mover.ok(  { 1: 2, 2: 1, 3: 1, 4: 1, 5: 6, 6: 0, 7: 2, 8: 0 });
            ok.ok.should.be.true;
        });
        it('weird stuff', function() {
            mover = new pocketciv.TribeMover(map);
            mover.init({ 1: 3, 2: 2, 3: 2, 4: 2, 5: 2, 6: 0, 7: 2, 8: 0 });
            var ok =
            mover.ok(  { 1: 3, 2: 1, 3: 1, 4: 1, 5: 6, 6: 0, 7: 1, 8: 0 });
            ok.ok.should.be.true;
        });
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
            mover.ok({ 1: 1, 2: 1, 3: 1, 4: 1 }).ok.should.be.true;
        });
        it('case 2', function() {
            mover.init({ 1: 1, 2: 1, 3: 0, 4: 0 });
            mover.ok(  { 1: 0, 2: 0, 3: 1, 4: 1 }).ok.should.be.true;
            //mover.ok(  { 1: 0, 2: 1, 3: 1, 4: 0 }).ok.should.be.true;
            //mover.ok(  { 1: 0, 2: 0, 3: 2, 4: 0 }).ok.should.be.true;
        });
        it('case 3', function() {
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 0 });
            mover.ok({ 1: 0, 2: 2, 3: 0, 4: 0 }).ok.should.be.true;
            mover.ok({ 1: 1, 2: 1, 3: 0, 4: 0 }).ok.should.be.true;
            mover.ok({ 1: 1, 2: 0, 3: 1, 4: 0 }).ok.should.be.true;
            mover.ok({ 1: 1, 2: 0, 3: 0, 4: 1 }).ok.should.be.false;
        });
        it('case 4 - neighbour limit', function() {
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 0 });
            mover.ok({ 1: 2, 2: 2, 3: 0, 4: 0 }).ok.should.be.false;
        });
        it('case 5', function() {
            mover.init({ 1: 2, 2: 0, 3: 0, 4: 0 });
            mover.ok(  { 1: 0, 2: 1, 3: 1, 4: 0 }).ok.should.be.true;
        });
    });
    describe('two steps', function() {
        describe('scenario 9', function() {
            beforeEach(function() {
                //
                map = {
                    "1": { "id": 1, "tribes": 1, "forest": true, "mountain": true, "neighbours": [ 7, 8, 'sea', 'frontier'], },
                    "2": { "id": 2, "desert": true, "neighbours": [ 3, 4, 5, 'frontier'], },
                    "3": { "id": 3, "forest": true, "volcano": true, "neighbours": [ 2, 5, 'sea', 'frontier'] , },
                    "4": { "id": 4, "forest": true, "mountain": true, "neighbours": [ 2, 5, 'sea', 'frontier'] },
                    "5": { "id": 5, "forest": true, "neighbours": [ 2, 3, 4, 'sea'], },
                    "6": { "id": 6, "tribes": 1, "city": 2, "forest": true, "neighbours": [ 7, 8, 'sea', 'frontier'], },
                    "7": { "id": 7, "tribes": 1, "forest": true, "fault": true, "neighbours": [ 1, 6, 8, 'frontier' ] },
                    "8": { "id": 8, "tribes": 1, "forest": true, "neighbours": [ 1, 6, 7, 'sea', 'frontier'], },
                }
                mover = new pocketciv.TribeMover(map, 2, 1);
            });
            it('case 1', function() {
                mover.init({ 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 });
                var ok =
                mover.ok(  { 1: 2, 2: 0, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0 });
                ok.ok.should.be.true;
            });
            it('case 2', function() {
                mover = new pocketciv.TribeMover(map);
                mover.init({ 1: 0, 6: 2, 7: 2, 8: 2 });
                var ok =
                mover.ok(  { 1: 3, 6: 1, 7: 1, 8: 1 });
                ok.ok.should.be.true;
            });
        });
    });
    describe('slow ones', function() {
        describe('scenario 7', function() {
            beforeEach(function() {
                //     1 f 2
                //
                //  7    sea
                //   \
                //     5 - 6 - 3 - 4
                //         \  /
                //           8
                map = {
                    1: { 'neighbours': ['sea','frontier'] },
                    2: { 'neighbours': ['sea','frontier'] },
                    3: { "neighbours": [ 4, 6, 8, 'sea', 'frontier'] },
                    4: { "neighbours": [ 3, 'sea', 'frontier']},
                    5: { "neighbours": [ 6, 7, 'sea', 'frontier'] },
                    6: { "neighbours": [ 3, 5, 8, 'sea', 'frontier']},
                    7: { "neighbours": [ 5, 'sea', 'frontier' ] },
                    8: { "neighbours": [ 3, 6, 'frontier' ] },
                }
            });
            it("case 1", function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 1: 0, 2: 0, 3: 3, 4: 2, 5: 1, 6: 3, 7: 1, 8: 2 });
                var ok =
                mover.ok(  { 1: 2, 2: 3, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 1 },
                    function(v) {
                        // succeeded! stop!
                        mover.stop();
                        console.log("stopped")
                    }
                )
                console.log("exied")
                ok.ok.should.equal("stopped");
            });
            it("case 2", function() {
                mover = new pocketciv.TribeMover(map, 1);
                mover.init({ 1: 0, 2: 0, 3: 2, 4: 2, 5: 0, 6: 2, 7: 0, 8: 2 });
                var ok =
                mover.ok(  { 1: 0, 2: 0, 3: 2, 4: 3, 5: 0, 6: 0, 7: 0, 8: 1 });
                ok.ok.should.be.false;
            });
            it("case 3", function() {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 1: 0, 2: 0, 3: 2, 4: 2, 5: 0, 6: 2, 7: 2, 8: 2 });
                var ok =
                mover.ok(  { 1: 4, 2: 0, 3: 1, 4: 2, 5: 0, 6: 1, 7: 2, 8: 0 });
                ok.ok.should.be.true;
                ok.cost.should.deep.equal([{ 1: 2 }]);
            });
        });
        describe('scenario 13', function() {
            beforeEach(function() {
                //     2
                //
                //  6  sea  4 - 5
                //    
                //      7 - 8
                //       \ / \
                //        1 - 3
                map = {
                    1: { 'neighbours': [7,8,3,'sea'] },
                    2: { 'neighbours': ['sea','frontier'] },
                    3: { "neighbours": [1,8,'sea'] },
                    4: { "neighbours": [5, 'sea']},
                    5: { "neighbours": [4, 'sea', 'frontier'] },
                    6: { "neighbours": ['sea', 'frontier']},
                    7: { "neighbours": [1,8, 'sea' ] },
                    8: { "neighbours": [1,3,7,'sea' ] },
                }
            });
            it("case 1", function(done) {
                mover = new pocketciv.TribeMover(map, 1, 1);
                mover.init({ 1: 6, 2: 1, 3: 6, 4: 1, 5: 1, 6: 1, 7: 6, 8: 6 });
                var ok =
                mover.ok(  { 1: 5, 2: 2, 3: 5, 4: 2, 5: 2, 6: 2, 7: 5, 8: 5 });
                ok.ok.should.be.true;
                done();
            });
        });
    });
});