var eventDeck = require('./eventdeck').EventDeck;

var Set = function() {}
Set.prototype.add = function(o) { this[o] = true; }
Set.prototype.remove = function(o) { delete this[o]; }
Set.prototype.values= function(o) { return Object.keys(this); }

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
        var left = Object.keys(eventDeck).filter(function (x) { return that.usedCards.indexOf(parseInt(x)) < 0 });
        var n = left[Math.floor((Math.random() * left.length))]
        var card = eventDeck[n];
        card.id = parseInt(n);
        this.usedCards.push(parseInt(n));
        return card;
    },
};

function Map() {
    this.areas = {}
}

Map.prototype = {
    moveTribes: function(situation) {
        for (var key in situation)
        {
            this.areas[key].tribes = situation[key];
        }
    },
    addTribe: function(area, amount) {
        amount = typeof amount !== 'undefined' ? amount : 1;
        this.areas[area].tribes += amount;
    },
    removeTribe: function(area, amount) {
        amount = typeof amount !== 'undefined' ? amount : 1;
        this.areas[area].tribes -= amount;
    }
}

function TribeMover(map, moveLimit) {
    this.start = {};
    this.map = map;
    this.neighbours = {};
    this.neighbours2 = {};
    for (var key in this.map)
    {
        var ngh = this.map[key]['neighbours'];
        this.neighbours[key] = ngh.slice(0);
        var ngh2 = ngh.slice(0);
        for (var n in ngh2)
        {
            var n2 = this.map[ngh[n]]['neighbours'];
            ngh2 = ngh2.concat(n2);
        }
        ngh2 = ngh2.filter(function (e, p) {
            return ngh2.indexOf(e) == p;
        })
        ngh2.splice(ngh2.indexOf(parseInt(key)),1);
        this.neighbours2[key] = ngh2;
    }
    this.moveLimit = moveLimit;
}

TribeMover.prototype = {
    init: function(start) {
        this.start = start;
        this.max = this._nghValue(start);
        this.ngh2 = this._2ngValue(start);
    },
    ok: function(situation) {
        var ngh = this._nghValue(situation);
        /*
        console.log('--COMP--')
        console.log('start')
        console.log(this.start)
        console.log('ngh')
        console.log(this.neighbours)
        console.log('ngh2')
        console.log(this.neighbours2)
        console.log('curr - situation')
        console.log(situation)
        console.log('curr - ngh')
        console.log(ngh)
        */
        for (var key in situation)
        {
            var curr = situation[key];
            if (curr > this.max[key]) return false;
            if (ngh[key] < this.start[key]) return false;
            if (ngh[key] > this.ngh2[key]) return false;
        }
        return true;
    },
    _nghValue: function(situation) {
        var nghVal = {};
        for (var key in situation)
        {
            var ngh = this.neighbours[key];
            nghVal[key] = situation[key];
            for (var n in ngh)
            {
                nghVal[key] += situation[ngh[n]];
            }
        }
        return nghVal;
    },
    _2ngValue: function(situation) {
        var nghVal = {};
        for (var key in situation)
        {
            var ngh = this.neighbours2[key];
            nghVal[key] = situation[key];
            for (var n in ngh)
            {
                nghVal[key] += situation[ngh[n]];
            }
        }
        return nghVal;
    }
}

function Engine(map, deck) {
    this.mover = function() { throw "Not implemented"; }
    this.map = map;
    this.deck = deck;
    this.phases = ["populate", "move", "event", "advance"];
    this.phase = "populate";
    this.era = 1;
}

Engine.prototype = {
    init: function(state) {
        if ('deck' in state)
        {
            this.deck.usedCards = state.deck.usedCards;
        }
    },
    nextPhase: function() {
        this.phase = this.phases[this.phases.indexOf(this.phase)+1];
        console.log("Phase is now "+this.phase);
    },
    populate: function() {
        console.log("Populating areas");
        for (var key in this.map.areas)
        {
            if (this.map.areas[key].tribes > 0)
                this.map.areas[key].tribes += 1;
        }
        this.nextPhase();
    },
    move: function() {
        console.log("Moving tribes with mover");
        this.mover(this.map.areas, function(end) {
            for (var key in this.map.areas)
            {
                this.map.areas[key].tribes = end[key];
            }
            this.nextPhase();
        });
    }
    ,
    event: function() {
        console.log("Drawing event card")
        this.drawer(this.deck, function(card) {
            var eng = this;
            if (eng.era in card.events)
            {
                var event = card.events[eng.era];
                eng.events[event.name].run(eng, event, function() {
                    eng.nextPhase();
                })
                console.log("Event: "+event);
            } else {
                console.log("No event!");
                eng.nextPhase();
            }
        });
    }
}

var theMap = new Map();
var theDeck = new EventDeck();

module.exports = {
    example: function(a) {
        return a + "--";
    }
    ,
    NoMoreCardsError: NoMoreCardsError,
    EventDeck: theDeck,
    Map: theMap,
    TribeMover: TribeMover,
    Engine: new Engine(theMap, theDeck),
}