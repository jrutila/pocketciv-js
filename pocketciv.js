var eventDeck = require('./eventdeck').EventDeck;
var events = {
    'famine': require('./events/famine'),
}

var advances = {
    'farm': require('./actions/farm'),
    'city': require('./actions/city'),
}

var irrigation = {}

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
    specific: function(n) {
      return eventDeck[n];  
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
        var ngh = this.map[key]['neighbours'].slice(0);
        ngh = ngh.filter(function (e) { return typeof e != "string"; })
        this.neighbours[key] = ngh.slice(0);
        var ngh2 = ngh.slice(0);
        console.log(ngh)
        for (var n in ngh2)
        {
            var n2 = this.map[ngh[n]]['neighbours'].slice(0);
            n2 = n2.filter(function (e) { return typeof e != "string"; })
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

function sum(arr) {
    var total = 0;

    for (var i in arr)
    {
        total += arr[i];
    }

    return total;
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
        console.log('this.start')
        console.log(this.start)
        console.log('this.neighbours')
        console.log(this.neighbours)
        console.log('this.neighbours2')
        console.log(this.neighbours2)
        console.log('this.max')
        console.log(this.max)
        console.log('this.ngh2')
        console.log(this.ngh2)
        console.log('curr - situation')
        console.log(situation)
        console.log('curr - ngh')
        console.log(ngh)
        console.log(sum(this.start) + " != " + sum(situation))
        */
        if (sum(this.start) != sum(situation))
            return false;
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
    for (var key in map)
    {
        map[key].id = key;
    }
    this.deck = deck;
    this.phases = ["populate", "move", "event", "advance"];
    this.phase = "populate";
    this.events = events;
    this.advances = advances;
    this.era = 1;
}

function draw_active_area() {
    
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
    },
    advance: function(name) {
        console.log("Running advance "+name);
        this.advances[name].run(this);
    }
    ,
    event: function(done) {
        console.log("Drawing event card")
        this.drawer(this.deck, function(card) {
            var eng = this;
            if (eng.era in card.events)
            {
                var event = card.events[eng.era];
                console.log("Event: "+event);
                var ev = eng.events[event.name];
                if (ev.hasOwnProperty('run'))
                    ev.run(eng, event, function() {
                        eng.nextPhase();
                        done();
                    });
                else
                {
                    console.log('No run method. Doing steps!')
                    var patt = /{% (.*?) %}/g;
                    var area = undefined;
                    var change = undefined;
                    area_card = function(done) {
                        console.log("Drawing area card");
                        eng.drawer(eng.deck, function(card) {
                            var area_id = card.circle;
                            if (area_id in eng.map.areas)
                            {
                                area = eng.map.areas[area_id];
                                done();
                            }
                        });
                    };
                    var adv = function(advance) {
                        return false;
                    };
                    final = function(d) {
                        console.log(area);
                        console.log(change);
                        if (area && change)
                        {
                            eng.areaChange(area, change, function() {
                                eng.nextPhase();
                                d();
                            });
                        }
                        else {
                            console.log("No area change");
                            d();
                        }
                    };
                    var steps_cmd = [];
                    for (var key in ev.steps)
                    {
                        var step = ev.steps[key];
                        var m = step.match(patt);
                        var cmd = "";
                        for (var s in m)
                        {
                            cmd += m[s].replace(patt, "$1");
                        }
                        steps_cmd.push(cmd);
                    }
                    steps_cmd.push("final");
                    
                    var stepper = function(steps) {
                        if (steps.length == 0)
                        {
                            return done && done();
                        }
                        var cmd = steps.shift();
                        var callback = function() { stepper(steps); }
                        console.log(cmd);
                        if (cmd in this)
                        {
                            // It is a function
                            this[cmd].call(this, callback);
                        } else {
                            (function(d) {
                                eval(cmd);
                                d();
                            })(callback);
                        }
                    };
                    stepper(steps_cmd);
                }
            } else {
                console.log("No event!");
                eng.nextPhase();
                done && done();
            }
        });
    },
    areaChange: function(area, change, done) {
        this.areaChanger(area, change, function() {
            for (var k in change)
            {
                if (change[k] === true || change[k] === false)
                    area[k] = change[k];
                else
                {
                    var v = change[k];
                    if (!area[k])
                        area[k] = 0;
                    
                    if (v.indexOf('-') == 0 || v.indexOf('+') == 0)
                        area[k] += parseInt(v);
                    else
                        area[k] = parseInt(v);
                }
            }
            done && done();
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