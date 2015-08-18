var should = require('chai').should();
var expect = require('chai').expect;
var _ = require("underscore");
var pp = require('../../src/phases/move').pp;

describe('perms', function() {
    it("should work on zero case", function() {
        var perms = [];
        pp({}, perms, { 4: 2 });
        perms.should.deep.equal([
            { 4: 0 }, { 4: 1 }, { 4: 2 }
        ]);
    });
    it("should work with max case", function() {
        var perms = [];
        pp({}, perms, { 4: 5 }, 3);
        perms.should.deep.equal([
            { 4: 0 }, { 4: 1 }, { 4: 2 }, { 4: 3 }
        ]);
    });
    it("should work on many case", function() {
        var perms = [];
        pp({}, perms, { 4: 2, 5: 3 });
        console.log(perms)
        perms.should.deep.equal([
            { 4: 0, 5: 0 },
            { 4: 0, 5: 1 },
            { 4: 0, 5: 2 },
            { 4: 0, 5: 3 },
            { 4: 1, 5: 0 },
            { 4: 1, 5: 1 },
            { 4: 1, 5: 2 },
            { 4: 1, 5: 3 },
            { 4: 2, 5: 0 },
            { 4: 2, 5: 1 },
            { 4: 2, 5: 2 },
            { 4: 2, 5: 3 },
            ])
    });
    it("should work on many case with max", function() {
        var perms = [];
        pp({}, perms, { 4: 2, 5: 3 }, 2);
        console.log(perms)
        perms.should.deep.equal([
            { 4: 0, 5: 0 },
            { 4: 0, 5: 1 },
            { 4: 0, 5: 2 },
            { 4: 1, 5: 0 },
            { 4: 1, 5: 1 },
            { 4: 2, 5: 0 },
            ])
    });
    it("should work on four areas case", function() {
        var perms = [];
        pp({}, perms, { 4: 2, 5: 3, 6: 0, 7: 1 });
        console.log(perms)
        perms.should.deep.equal(
[ { '4': 0, '5': 0, '6': 0, '7': 0 },
  { '4': 0, '5': 0, '6': 0, '7': 1 },
  { '4': 0, '5': 1, '6': 0, '7': 0 },
  { '4': 0, '5': 1, '6': 0, '7': 1 },
  { '4': 0, '5': 2, '6': 0, '7': 0 },
  { '4': 0, '5': 2, '6': 0, '7': 1 },
  { '4': 0, '5': 3, '6': 0, '7': 0 },
  { '4': 0, '5': 3, '6': 0, '7': 1 },
  { '4': 1, '5': 0, '6': 0, '7': 0 },
  { '4': 1, '5': 0, '6': 0, '7': 1 },
  { '4': 1, '5': 1, '6': 0, '7': 0 },
  { '4': 1, '5': 1, '6': 0, '7': 1 },
  { '4': 1, '5': 2, '6': 0, '7': 0 },
  { '4': 1, '5': 2, '6': 0, '7': 1 },
  { '4': 1, '5': 3, '6': 0, '7': 0 },
  { '4': 1, '5': 3, '6': 0, '7': 1 },
  { '4': 2, '5': 0, '6': 0, '7': 0 },
  { '4': 2, '5': 0, '6': 0, '7': 1 },
  { '4': 2, '5': 1, '6': 0, '7': 0 },
  { '4': 2, '5': 1, '6': 0, '7': 1 },
  { '4': 2, '5': 2, '6': 0, '7': 0 },
  { '4': 2, '5': 2, '6': 0, '7': 1 },
  { '4': 2, '5': 3, '6': 0, '7': 0 },
  { '4': 2, '5': 3, '6': 0, '7': 1 } ]
            )
    });
});