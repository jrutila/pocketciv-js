var events = {
    1: {
        'circle': 1,
        'square': 7,
        'hexagon': 6,
        'ab': 'A',
        'friendly': true,
        'gold': 0
    },
    2: {
    },
    3: {
    },
    4: {
    },
    5: {
    },
    6: {
    },
    7: {
    },
    8: {
    },
    9: {
    },
    10: {
    },
    11: {
    },
    12: {
    },
    13: {
    },
    14: {
    },
    15: {
    },
    16: {
    },
};

function NoMoreCardsError(message) {
}

NoMoreCardsError.prototype = Error.prototype;

function EventDeck() {
    this.usedCards = [];
}

EventDeck.prototype = {
    shuffle: function() {
        this.usedCards = [];
        this.draw();
        this.draw();
        this.draw();
    },
    get cardsLeft() {
        return 16 - this.usedCards.length;
    },
    draw: function() {
        if (this.cardsLeft == 0)
            throw new NoMoreCardsError("No more cards");
        var that = this;
        var left = Object.keys(events).filter(function (x) { return that.usedCards.indexOf(parseInt(x)) < 0 });
        var n = left[Math.floor((Math.random() * left.length))]
        var card = events[n];
        card.id = parseInt(n);
        this.usedCards.push(parseInt(n));
        return card;
    },
};

module.exports = {
    example: function(a) {
        return a + "--";
    }
    ,
    NoMoreCardsError: NoMoreCardsError,
    EventDeck: new EventDeck(),
}