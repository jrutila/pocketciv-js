var should = require('chai').should()
var pocketciv = require('../pocketciv')

describe('#example', function() {
    it("adds -- to a string", function() {
        pocketciv.example('hei').should.equal('hei--');
    })
});

describe('EventDeck', function() {
    describe('initialization', function() {
        beforeEach(function() {
            pocketciv.EventDeck.shuffle();
        });
        it('should create thirteen cards when shuffled', function() {
            pocketciv.EventDeck.cardsLeft.should.equal(13);
        });
        it('should return a different card when drawn', function() {
            var away = pocketciv.EventDeck.usedCards.slice(0);
            var drawn = [];
            for (var i = 0; i < 13; i++)
            {
                var card = pocketciv.EventDeck.draw();
                card.id.should.be.within(1,16);
                drawn.push(card.id);
                pocketciv.EventDeck.cardsLeft.should.equal(12-i);
            }
            var all = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
            drawn.should.have.members(all.filter(function(x) { return away.indexOf(x) < 0 }));
        });
        it('should throw NoMoreCards exception if all cards are drawn', function(done) {
            for (var i = 0; i < 13; i++)
            {
                pocketciv.EventDeck.draw();
            }
            try {
                pocketciv.EventDeck.draw();
                fail();
            } catch (ex) {
                done();
            }
            //pocketciv.EventDeck.draw().should.throw(pocketciv.NoMoreCardsError);
        });
    });
});