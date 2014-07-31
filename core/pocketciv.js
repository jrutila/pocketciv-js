var eventDeck = require('./eventdeck').EventDeck;
var _ = require("underscore");
var eventRunner = require('./event')

var events = {
    'famine': require('../events/famine'),
    'anarchy': require('../events/anarchy'),
    'civil_war': require('../events/civil_war'),
    'corruption': require('../events/corruption'),
    'visitation': require('../events/visitation'),
    'flood': require('../events/flood'),
    'epidemic': require('../events/epidemic'),
    'tribal_war': require('../events/tribal_war'),
}

var actions = {
    'farm': require('../actions/farm'),
    'city': require('../actions/city'),
    'acquire': require('../actions/acquire'),
}

var advances = {
    'irrigation': require('../advances/irrigation'),
    'literacy': require('../advances/literacy'),
    'agriculture': require('../advances/agriculture'),
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
    draw: function(nn) {
        if (this.cardsLeft == 0)
            throw new NoMoreCardsError("No more cards");
        var that = this;
        var left = Object.keys(eventDeck).filter(function (x) { return that.usedCards.indexOf(parseInt(x)) < 0 });
        var n = nn || left[Math.floor((Math.random() * left.length))]
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
    },
    get tribeCount() {
      return _.reduce(_.values(this.areas), function(memo, area){ return area.tribes ?  memo + area.tribes: memo }, 0)
    },
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
        if (arr[i] == undefined) arr[i] = 0;
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
            if (curr == undefined) curr = 0;
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
    this.reducer = function() { throw "Not implemented"; }
    this.drawer = function() { throw "Not implemented"; }
    this.areaChanger = function() { throw "Not implemented"; }
    this.map = map || theMap;
    this.deck = deck || theDeck;
    this.phases = ["populate", "move", "event", "advance", "support", "gold_decimate", "city_support", "upkeep" ];
    this.phase = "populate";
    this.events = events;
    this.advances = advances;
    this.acquired = {};
    this.trading = [];
    this.actions = actions;
    this.gold = 0;
    this.round = {} // Will be emptied after upkeep!
    this.era = 1;
}

Engine.prototype = {
    init: function(state) {
        if ('deck' in state)
        {
            this.deck.usedCards = state.deck.usedCards;
        }
        if (_.has(state, 'map'))
        {
            _.extend(this.map, state.map)
            for (var key in this.map.areas)
            {
                this.map.areas[key].id = key;
            }
        }
    },
    nextPhase: function() {
        this.phase = this.phases[this.phases.indexOf(this.phase)+1];
        console.log("Phase is now "+this.phase);
    },
    populate: function() {
        console.log("Populating areas");
        var changes = {};
        for (var key in this.map.areas)
        {
            if (this.map.areas[key].tribes > 0)
                changes[key] = { 'tribes': '+1' };
        }
        this.areaChange(changes, function() {
            this.nextPhase();
        })
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
        var context = {};
        var eng = this;
        for (var key in eng.acquired)
        {
            if (name in eng.acquired[key].actions)
            {
                _.extend(context, eng.acquired[key].actions[name].context(this));
            }
        }
        this.actions[name].run.call(this, context);
    }
    ,
    acquire: function(name, done) {
        this.acquired[name] = this.advances[name];
        console.log("Acquired "+name);
        done && done();
    }
    ,
    event: function(done) {
        console.log("Drawing event card")
        this.drawer(this.deck, function(eventcard) {
            var eng = this;
            if (eng.era in eventcard.events)
            {
                var ev = eventcard.events[eng.era];
                console.log("Drew event: "+ev.name);
                eng.doEvent(ev, function() {
                    eng.nextPhase();
                    done && done();
                });
            } else {
                console.log("No event!");
                eng.nextPhase();
                done && done();
            }
        });
    },
    doEvent: function(ev, done) {
        var eng = this;
        var event = eng.events[ev.name];
        eventRunner.runEvent(eng, event, ev, function(changes) {
            eng.areaChange(changes, function() {
                done && done();
            });
        });
    },
    support: function() {
        var engine = this;
        var changes = {};
        var areas = engine.map.areas;
        for (var a in areas)
        {
            var area = areas[a];
            var support_val = 0;
            if (area.mountain || area.volcano) support_val++;
            if (area.forest) support_val++;
            if (area.farm) support_val++;
            if (area.city) support_val += area.city;
            
            if (area.tribes > support_val)
                changes[area.id] = {'tribes': (support_val-area.tribes).toString()};
        }
        engine.areaChange(changes, function() {
            engine.nextPhase();
        });
    },
    gold_decimate: function() {
        var engine = this;
        engine.areaChange({ 'gold': '0' }, function() {
            engine.nextPhase();
        });
    },
    city_support: function() {
        var engine = this;
        var areas = engine.map.areas;
        var changes = {};
        for (var a in areas)
        {
            if (areas[a].city && !areas[a].farm)
            {
                changes[a] = { 'city': '-1' };
            }
        }
        engine.areaChange(changes, function() {
            engine.nextPhase();
        });
    },
    upkeep: function() {
        this.round = {};
        this.phase = 'populate';
    },
    areaChange: function(changes, done) {
        this.areaChanger(changes, function() {
            var applyChange = function(elem, change)
            {
                for (var k in change)
                {
                    if (change[k] === true || change[k] === false)
                        elem[k] = change[k];
                    else
                    {
                        var v = change[k];
                        if (!elem[k])
                            elem[k] = 0;
                        
                        if (v.indexOf('-') == 0 || v.indexOf('+') == 0)
                            elem[k] += parseInt(v);
                        else
                            elem[k] = parseInt(v);
                            
                        if (elem[k] < 0)
                            elem[k] = 0;
                    }
                }
            };
            
            for (var a in changes)
            {
                var change = changes[a];
                var area = this.map.areas[a];
                if (area)
                {
                    applyChange(area, change);
                }
                else
                {
                    change = {};
                    change[a] = changes[a];
                    applyChange(this, change)
                }
            }
            done && done.call(this);
        });
    }
}

function filterAreasWithoutCities(areas) {
    var result = {};
    
    for (var key in areas)
    {
        if (areas[key].hasOwnProperty('city') && areas[key].city)
            result[key] = areas[key];
    }
    return result;
}

function getResources(area) {
    var ret = [];
    if (area.mountain || area.volcano)
        ret.push('stone');
    if (area.farm)
        ret.push('food');
    if (area.forest)
        ret.push('wood');
    return ret;
}

function AdvanceAcquirer(engine) {
    this.advances = _.omit(_.clone(engine.advances), _.keys(engine.acquired));
    this.acquired = _.clone(engine.round.acquired) || {};
    this.acquired_names = _.keys(engine.acquired);
    this.areas = _.clone(engine.map.areas);
    this.areas = filterAreasWithoutCities(this.areas);
}

AdvanceAcquirer.prototype = {
    possibleAdvances: function() {
        var adv = {};
        for (var key in _.omit(this.advances, this.acquired_names))
        {
            // Check requirements
            if (_.has(this.advances[key], 'requires') && this.advances[key].requires)
            {
                var kk = _.keys(this.advances);
                var aq = this.acquired_names;
                var re = _.clone(this.advances[key].requires);
                
                // First, check optional requirements (either one must be required)
                // Remove them from re if they are satisfied
                var re = _.filter(re, function(r) {
                    if (!_.isArray(r)) return true;
                    return _.intersection(r, aq).length < 1;
                });
                // Check that all requirements are acquired
                if (!_.isEqual(_.intersection(aq, re), re))
                {
                    continue;
                }
            }
            
            adv[key] = { 'areas': [] };
            
            for (var a in _.omit(this.areas, _.keys(this.acquired)))
            {
                // Check tribes
                var has_tribes = true;
                var has_resources = true;
                if ('tribes' in this.advances[key].cost)
                {
                    if (!(this.areas[a].tribes >= this.advances[key].cost.tribes))
                        has_tribes = false;
                }
                
                // Check resources
                if ('resources' in this.advances[key])
                {
                    var area_resources = getResources(this.areas[a]);
                    if(!_.intersection(
                        area_resources, this.advances[key].resources).length
                        ==
                        this.advances[key].resources.length)
                        {
                            has_resources = false;
                        }
                }
                
                if (has_tribes && has_resources)
                    adv[key].areas.push(a);
            }
        }
        return adv;
    },
    acquire: function(name, area) {
        this.acquired[area] = this.advances[name];
        this.acquired_names.push(name);
    },
    deacquire: function(name) {
        for (var a in this.acquired)
        {
            if (this.acquired[a] == this.advances[name])
            {
                delete this.acquired[a];
                break;
            }
        }
        this.acquired_names.pop(name);
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
    AdvanceAcquirer: AdvanceAcquirer,
    Engine: new Engine(theMap, theDeck),
    Advances: advances,
}
